using System.Globalization;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Util;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Caminhões. O km só sobe (cadastro, Atualizar km, OS e Editar veículo); para baixar um km digitado
/// errado, Admin ou Gestor usam a correção, com motivo. Toda mudança de km fica no histórico (RegistroKm).
/// </summary>
public class ServicoVeiculo(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Manutencao> servicoManutencao,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoVeiculo> logger) : ServicoCrud<Veiculo>(repositorioCrud, logger)
{
    private static readonly CultureInfo PtBr = new("pt-BR");

    public override bool Valida(Veiculo entidade)
    {
        if (!Enum.IsDefined(entidade.Tracao))
        {
            Mensagens.Add("Escolha a tração do caminhão.");
        }

        // A placa chega como foi digitada e é gravada no formato do sistema (ABC-1D23)
        var placa = PlacaUtil.Formatar(entidade.Placa);
        if (placa is null)
        {
            Mensagens.Add("Placa inválida. Use o padrão ABC-1234 ou ABC-1D23.");
        }
        else
        {
            entidade.Placa = placa;
        }

        // A consulta só olha a empresa de quem está logado: em outra empresa a placa pode existir
        if (placa is not null && Query(v => v.Id != entidade.Id && v.Placa == placa).Any())
        {
            Mensagens.Add("Já existe um caminhão com essa placa.");
        }

        if (Query(v => v.Id != entidade.Id && v.Chassi == entidade.Chassi).Any())
        {
            Mensagens.Add("Já existe um caminhão com esse chassi.");
        }

        if (entidade.KmAtual < 0)
        {
            Mensagens.Add("O km do caminhão não pode ser negativo.");
        }

        // Ano modelo = ano de fabricação ou o seguinte (ex.: fabricado em 2019, modelo 2019 ou 2020)
        var anoFabricacao = entidade.AnoFabricacao.Year;
        var anoModelo = entidade.AnoModelo.Year;
        if (!AnoUtil.IsValido(anoFabricacao) || !AnoUtil.IsValido(anoModelo))
        {
            Mensagens.Add($"Os anos de fabricação e modelo vão de {AnoUtil.AnoMinimo} a {AnoUtil.AnoMaximo}.");
        }
        else if (anoModelo != anoFabricacao && anoModelo != anoFabricacao + 1)
        {
            Mensagens.Add("O ano modelo é o ano de fabricação ou o seguinte (ex.: fabricado em 2019, modelo 2019 ou 2020).");
        }

        return base.Valida(entidade);
    }

    public override Veiculo? Inserir(Veiculo entidade)
    {
        entidade.RegistrosKm.Add(NovoRegistroKm(null, entidade.KmAtual, OrigemKm.Cadastro, usuarioLogado.Usuario));
        return base.Inserir(entidade);
    }

    /// <summary>Editar veículo: o km pode subir, mas não descer.</summary>
    public override Veiculo? Atualizar(Veiculo entidade) => SalvarKm(entidade, OrigemKm.Edicao);

    /// <summary>Soma ao km do caminhão a distância que ele rodou (maior que zero).</summary>
    public bool AtualizarKmVeiculo(long veiculoId, int distancia)
    {
        if (distancia <= 0)
        {
            Mensagens.Add("Informe quantos km o caminhão rodou (maior que zero).");
            return false;
        }

        var veiculo = GetById(veiculoId);
        if (veiculo is null)
        {
            Mensagens.Add("Veículo não encontrado.");
            return false;
        }

        veiculo.KmAtual += distancia;
        return SalvarKm(veiculo, OrigemKm.AtualizarKm) is not null;
    }

    /// <summary>
    /// Corrige o km (ex.: alguém digitou um zero a mais). Só Admin e Gestor chegam aqui (a API confere).
    /// Pode baixar o km, mas não para menos que o km da maior OS do caminhão: se a OS também estava
    /// errada, corrige a OS antes. O motivo é obrigatório e fica no histórico.
    /// </summary>
    public Veiculo? CorrigirKm(long veiculoId, int kmNovo, string? motivo)
    {
        motivo = motivo?.Trim();
        if (string.IsNullOrEmpty(motivo))
        {
            Mensagens.Add("Informe o motivo da correção (ex.: zero a mais).");
            return null;
        }

        if (kmNovo < 0)
        {
            Mensagens.Add("O km do caminhão não pode ser negativo.");
            return null;
        }

        var veiculo = GetById(veiculoId);
        if (veiculo is null)
        {
            return null;
        }

        if (veiculo.KmAtual == kmNovo)
        {
            Mensagens.Add("O caminhão já está com esse km.");
            return null;
        }

        var maiorOs = servicoManutencao.Query(m => m.Veiculo.Id == veiculoId)
            .OrderByDescending(m => m.KmAtual)
            .Select(m => new { m.Id, m.KmAtual })
            .FirstOrDefault();
        if (maiorOs is not null && kmNovo < maiorOs.KmAtual)
        {
            Mensagens.Add(string.Create(PtBr,
                $"A OS nº {maiorOs.Id} foi lançada com {maiorOs.KmAtual:N0} km. Use um km a partir desse ou corrija a OS antes."));
            return null;
        }

        veiculo.KmAtual = kmNovo;
        return SalvarKm(veiculo, OrigemKm.Correcao, motivo);
    }

    /// <summary>Registro do histórico de km. A OS (quando é ela que muda o km) liga o registro ao número da OS.</summary>
    public static RegistroKm NovoRegistroKm(int? kmAnterior, int kmNovo, OrigemKm origem, Usuario? registradoPor,
        string? motivo = null, Manutencao? ordemServico = null) => new()
    {
        KmAnterior = kmAnterior,
        KmNovo = kmNovo,
        Origem = origem,
        Motivo = motivo,
        OrdemServico = ordemServico,
        RegistradoPor = registradoPor,
        RegistradoEm = DateTime.UtcNow,
    };

    // Grava o caminhão e, se o km mudou, o histórico. Só a correção pode baixar o km.
    // Atualizar km e correção só mexem no km: não são barrados por outro campo do cadastro (ex.: caminhão
    // cadastrado antes da regra de ano). O Editar veículo valida o cadastro inteiro.
    private Veiculo? SalvarKm(Veiculo veiculo, OrigemKm origem, string? motivo = null)
    {
        // Projeção: lê o km gravado no banco sem rastrear outra cópia do caminhão
        var kmAnterior = Query(v => v.Id == veiculo.Id).Select(v => (int?)v.KmAtual).FirstOrDefault();
        if (kmAnterior is null)
        {
            Mensagens.Add("Veículo não encontrado.");
            return null;
        }

        if (origem != OrigemKm.Correcao && veiculo.KmAtual < kmAnterior)
        {
            Mensagens.Add("O km não pode diminuir. Se foi digitado errado, peça para o Admin ou o Gestor usar Corrigir km.");
            return null;
        }

        if (veiculo.KmAtual != kmAnterior)
        {
            veiculo.RegistrosKm.Add(NovoRegistroKm(kmAnterior, veiculo.KmAtual, origem, usuarioLogado.Usuario, motivo));
        }

        if (origem == OrigemKm.Edicao)
        {
            return base.Atualizar(veiculo);
        }

        return MakeTransaction(repositorio => repositorio.Update(veiculo)) ? veiculo : null;
    }
}
