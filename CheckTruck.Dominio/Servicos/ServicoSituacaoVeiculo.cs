using System.Linq.Expressions;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Resultados;
using CheckTruck.Dominio.Util;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Calcula no servidor a situação de manutenção de cada veículo: para cada item, a próxima troca
/// por km e por data, quanto falta e o status. Vence o que chegar primeiro (km ou data).
/// O intervalo de cada item é o primeiro que existir na ordem de IntervalosPadrao.EmOrdem
/// (caminhão → empresa → fábrica → padrão seguro). Também monta as tabelas da tela Intervalos.
/// </summary>
public class ServicoSituacaoVeiculo(IRepositorioCrud repositorioCrud, ILogger<ServicoSituacaoVeiculo> logger)
{
    // RN-08: alerta quando faltam 5.000 km ou 30 dias para a próxima troca
    public const int MargemAlertaKm = 5000;
    public const int MargemAlertaDias = 30;

    public IList<SituacaoVeiculo> ObterSituacaoVeiculos(bool apenasAtivos)
    {
        logger.LogDebug("Calculando situação dos veículos (apenas ativos: {ApenasAtivos})", apenasAtivos);
        return Calcular(v => !apenasAtivos || v.Ativo);
    }

    /// <summary>Situação completa de um caminhão (todos os itens), para a tela de detalhe.</summary>
    public SituacaoVeiculo? ObterSituacao(long veiculoId)
    {
        logger.LogDebug("Calculando situação do veículo {VeiculoId}", veiculoId);
        return Calcular(v => v.Id == veiculoId).FirstOrDefault();
    }

    /// <summary>Situação completa de um caminhão pela placa (com ou sem hífen, maiúscula ou minúscula).</summary>
    public SituacaoVeiculo? ObterSituacaoPorPlaca(string placa)
    {
        var placaFormatada = PlacaUtil.Formatar(placa);
        logger.LogDebug("Calculando situação do veículo de placa {Placa}", placaFormatada);
        if (placaFormatada is null) return null;

        return Calcular(v => v.Placa == placaFormatada).FirstOrDefault();
    }

    /// <summary>
    /// Tela Intervalos, aba "Por geração": para cada item, os intervalos que existem na ordem em que valem
    /// (da empresa → de fábrica → padrão seguro). null quando a geração não existe.
    /// </summary>
    public IList<IntervalosDoItem>? TabelaDaGeracao(long geracaoId)
    {
        var norma = repositorioCrud.Query<Geracao>(g => g.Id == geracaoId)
            .Select(g => (NormaEmissao?)g.NormaEmissao)
            .FirstOrDefault();
        if (norma is null) return null;

        var cadastrados = CarregarIntervalos([], [geracaoId]);
        return CarregarTipos()
            .Select(t => new IntervalosDoItem(t.Id, cadastrados.EmOrdem(null, geracaoId, t, norma.Value)))
            .ToList();
    }

    /// <summary>
    /// Tela Intervalos, aba "Por caminhão": para cada item, os intervalos que existem na ordem em que valem
    /// (do caminhão → da empresa → de fábrica → padrão seguro). null quando o caminhão não existe.
    /// </summary>
    public IList<IntervalosDoItem>? TabelaDoVeiculo(long veiculoId)
    {
        var veiculo = ObterGeracaoDoVeiculo(veiculoId);
        if (veiculo is null) return null;

        var cadastrados = CarregarIntervalos([veiculoId], [veiculo.GeracaoId]);
        return CarregarTipos()
            .Select(t => new IntervalosDoItem(t.Id, cadastrados.EmOrdem(veiculoId, veiculo.GeracaoId, t, veiculo.NormaEmissao)))
            .ToList();
    }

    /// <summary>
    /// Intervalo que vale para um caminhão e um tipo de manutenção (o primeiro de <see cref="IntervalosPadrao.EmOrdem"/>).
    /// null quando o veículo ou o tipo não existem, ou quando não há intervalo nem padrão para o item.
    /// </summary>
    public IntervaloResolvido? ResolverIntervalo(long veiculoId, long tipoManutencaoId)
    {
        var veiculo = ObterGeracaoDoVeiculo(veiculoId);
        var tipo = CarregarTipos(t => t.Id == tipoManutencaoId).FirstOrDefault();
        if (veiculo is null || tipo is null) return null;

        return CarregarIntervalos([veiculoId], [veiculo.GeracaoId])
            .EmOrdem(veiculoId, veiculo.GeracaoId, tipo, veiculo.NormaEmissao)
            .FirstOrDefault();
    }

    public static StatusManutencao StatusPorKmRestante(int kmRestante)
    {
        if (kmRestante <= 0) return StatusManutencao.Critico;
        if (kmRestante <= MargemAlertaKm) return StatusManutencao.Atencao;
        return StatusManutencao.Ok;
    }

    public static StatusManutencao StatusPorDiasRestantes(int? diasRestantes)
    {
        if (diasRestantes is null) return StatusManutencao.Ok;
        if (diasRestantes <= 0) return StatusManutencao.Critico;
        if (diasRestantes <= MargemAlertaDias) return StatusManutencao.Atencao;
        return StatusManutencao.Ok;
    }

    public static DateTime? CalcularDataProximaTroca(DateTime realizadoEm, int intervaloMeses) =>
        intervaloMeses > 0 ? realizadoEm.AddMonths(intervaloMeses) : null;

    private IList<SituacaoVeiculo> Calcular(Expression<Func<Veiculo, bool>> filtro)
    {
        // Só projeções: o EF traduz as navegações para JOINs, sem carregar entidades inteiras.
        var veiculos = repositorioCrud.Query(filtro)
            .OrderBy(v => v.Placa)
            .Select(v => new SituacaoVeiculo
            {
                VeiculoId = v.Id,
                Placa = v.Placa,
                Chassi = v.Chassi,
                KmAtual = v.KmAtual,
                Ativo = v.Ativo,
                AnoFabricacao = v.AnoFabricacao,
                AnoModelo = v.AnoModelo,
                Tracao = v.Tracao,
                PotenciaCv = v.Potencia.Cv,
                GeracaoId = v.Potencia.Geracao.Id,
                GeracaoNome = v.Potencia.Geracao.Nome,
                NormaEmissao = v.Potencia.Geracao.NormaEmissao,
                Motor = v.Potencia.Geracao.Motor,
                Caixa = v.Potencia.Geracao.Caixa,
                ModeloId = v.Potencia.Geracao.Modelo.Id,
                ModeloNome = v.Potencia.Geracao.Modelo.Nome,
                FabricanteNome = v.Potencia.Geracao.Modelo.Fabricante.Nome,
                MotoristaAtualId = v.MotoristaAtual == null ? null : v.MotoristaAtual.Id,
                MotoristaAtualNome = v.MotoristaAtual == null ? null : v.MotoristaAtual.Nome,
            })
            .ToList();

        if (veiculos.Count == 0) return veiculos;

        var veiculoIds = veiculos.Select(v => v.VeiculoId).ToList();
        var geracaoIds = veiculos.Select(v => v.GeracaoId).Distinct().ToList();

        var tipos = CarregarTipos();
        var cadastrados = CarregarIntervalos(veiculoIds, geracaoIds);

        // Última troca de cada item em cada veículo (a próxima troca já foi gravada nela — RN-07)
        var ultimasTrocas = repositorioCrud.Query<Manutencao>(m => veiculoIds.Contains(m.Veiculo.Id))
            .Select(m => new
            {
                m.Id,
                VeiculoId = m.Veiculo.Id,
                TipoId = m.TipoManutencao.Id,
                m.RealizadoEm,
                m.KmAtual,
                m.KmProximaTroca,
                m.DataProximaTroca,
            })
            .ToList()
            .GroupBy(m => (m.VeiculoId, m.TipoId))
            .ToDictionary(g => g.Key, g => g.OrderByDescending(m => m.RealizadoEm).ThenByDescending(m => m.Id).First());

        var hoje = DateTime.UtcNow.Date;

        foreach (var veiculo in veiculos)
        {
            var itens = new List<ItemManutencao>();

            foreach (var tipo in tipos)
            {
                var intervalo = cadastrados.EmOrdem(veiculo.VeiculoId, veiculo.GeracaoId, tipo, veiculo.NormaEmissao).FirstOrDefault();
                if (intervalo is null) continue; // item sem intervalo cadastrado e sem padrão (ex.: embreagem)

                var item = new ItemManutencao
                {
                    TipoManutencaoId = tipo.Id,
                    TipoManutencaoNome = tipo.Nome,
                    IntervaloKm = intervalo.IntervaloKm,
                    IntervaloMeses = intervalo.IntervaloMeses,
                    OrigemIntervalo = intervalo.Origem,
                };

                int kmInicio; // km em que o ciclo atual começou (a última troca, ou o início do ciclo sem histórico)
                if (ultimasTrocas.TryGetValue((veiculo.VeiculoId, tipo.Id), out var ultima))
                {
                    kmInicio = ultima.KmAtual;
                    item.UltimaTrocaEm = ultima.RealizadoEm;
                    item.UltimaTrocaKm = ultima.KmAtual;
                    // Registros antigos podem não ter a próxima troca gravada: calcula pelo intervalo atual
                    item.KmProximaTroca = ultima.KmProximaTroca > 0
                        ? ultima.KmProximaTroca
                        : ultima.KmAtual + intervalo.IntervaloKm;
                    item.DataProximaTroca = ultima.DataProximaTroca
                        ?? CalcularDataProximaTroca(ultima.RealizadoEm, intervalo.IntervaloMeses);
                }
                else
                {
                    // Sem histórico no sistema não dá para saber a data da última troca: vence só por km
                    var (kmProximaTroca, isPrimeira) = CalcularSemHistorico(
                        veiculo.KmAtual, intervalo.IntervaloKm, intervalo.IntervaloKmPrimeira);
                    item.KmProximaTroca = kmProximaTroca;
                    item.IsPrimeiraTroca = isPrimeira;
                    kmInicio = isPrimeira ? 0 : kmProximaTroca - intervalo.IntervaloKm;
                }

                item.KmRestante = item.KmProximaTroca - veiculo.KmAtual;
                item.PercentualUsado = PercentualUsado(veiculo.KmAtual, kmInicio, item.KmProximaTroca);
                item.DiasRestantes = item.DataProximaTroca is { } data
                    ? (int)Math.Floor((data.Date - hoje).TotalDays)
                    : null;
                item.Status = Pior(StatusPorKmRestante(item.KmRestante), StatusPorDiasRestantes(item.DiasRestantes));

                itens.Add(item);
            }

            veiculo.Itens = itens
                .OrderByDescending(i => i.Status)
                .ThenBy(i => i.KmRestante)
                .ToList();
            veiculo.ItemMaisUrgente = veiculo.Itens.FirstOrDefault();
            veiculo.Status = veiculo.ItemMaisUrgente?.Status ?? StatusManutencao.Ok;
        }

        return veiculos;
    }

    private static StatusManutencao Pior(StatusManutencao a, StatusManutencao b) => a >= b ? a : b;

    private VeiculoDaGeracao? ObterGeracaoDoVeiculo(long veiculoId) =>
        repositorioCrud.Query<Veiculo>(v => v.Id == veiculoId)
            .Select(v => new VeiculoDaGeracao(v.Potencia.Geracao.Id, v.Potencia.Geracao.NormaEmissao))
            .FirstOrDefault();

    // Tipos de manutenção (itens que o sistema acompanha), sempre na mesma ordem
    private List<TipoDoItem> CarregarTipos(Expression<Func<TipoManutencao, bool>>? filtro = null) =>
        repositorioCrud.Query<TipoManutencao>(filtro ?? (_ => true))
            .OrderBy(t => t.Id)
            .Select(t => new TipoDoItem(t.Id, t.Nome, t.Componente))
            .ToList();

    // Intervalos cadastrados dos caminhões e das gerações, numa consulta para cada tabela
    private IntervalosCadastrados CarregarIntervalos(List<long> veiculoIds, List<long> geracaoIds)
    {
        var doVeiculo = repositorioCrud.Query<IntervaloVeiculo>(i => veiculoIds.Contains(i.Veiculo.Id))
            .Select(i => new { VeiculoId = i.Veiculo.Id, TipoId = i.TipoManutencao.Id, i.Id, i.IntervaloKm, i.IntervaloMeses, i.Observacao })
            .ToList()
            .ToDictionary(
                i => (i.VeiculoId, i.TipoId),
                i => new IntervaloResolvido(OrigemIntervalo.Veiculo, i.IntervaloKm, i.IntervaloMeses, Id: i.Id, Observacao: i.Observacao));

        // A geração pode ter os dois: o de fábrica (sem empresa) e o da empresa de quem está logado
        var daGeracao = repositorioCrud.Query<IntervaloRecomendado>(i => geracaoIds.Contains(i.Geracao.Id))
            .Select(i => new
            {
                GeracaoId = i.Geracao.Id,
                TipoId = i.TipoManutencao.Id,
                i.Id,
                i.EmpresaId,
                i.IntervaloKm,
                i.IntervaloMeses,
                i.IntervaloKmPrimeira,
                i.Fonte,
                i.Observacao,
            })
            .ToList()
            .ToLookup(i => i.EmpresaId is null ? OrigemIntervalo.Fabrica : OrigemIntervalo.Empresa);

        Dictionary<(long, long), IntervaloResolvido> DaOrigem(OrigemIntervalo origem) => daGeracao[origem].ToDictionary(
            i => (i.GeracaoId, i.TipoId),
            i => new IntervaloResolvido(origem, i.IntervaloKm, i.IntervaloMeses, i.IntervaloKmPrimeira, i.Id, i.Fonte, i.Observacao));

        return new IntervalosCadastrados(doVeiculo, DaOrigem(OrigemIntervalo.Empresa), DaOrigem(OrigemIntervalo.Fabrica));
    }

    private sealed record VeiculoDaGeracao(long GeracaoId, NormaEmissao NormaEmissao);

    private sealed record TipoDoItem(long Id, string Nome, Componente Componente);

    // Intervalos cadastrados por item: do caminhão (veículo, tipo) e da geração (geração, tipo)
    private sealed record IntervalosCadastrados(
        Dictionary<(long VeiculoId, long TipoId), IntervaloResolvido> DoVeiculo,
        Dictionary<(long GeracaoId, long TipoId), IntervaloResolvido> DaEmpresa,
        Dictionary<(long GeracaoId, long TipoId), IntervaloResolvido> DeFabrica)
    {
        public IList<IntervaloResolvido> EmOrdem(long? veiculoId, long geracaoId, TipoDoItem tipo, NormaEmissao norma) =>
            IntervalosPadrao.EmOrdem(
                veiculoId is { } id ? DoVeiculo.GetValueOrDefault((id, tipo.Id)) : null,
                DaEmpresa.GetValueOrDefault((geracaoId, tipo.Id)),
                DeFabrica.GetValueOrDefault((geracaoId, tipo.Id)),
                tipo.Componente,
                norma);
    }

    // Quanto do ciclo já foi rodado, de 0 a 100: do km de início até o km da próxima troca
    private static int PercentualUsado(int kmAtual, int kmInicio, int kmProximaTroca)
    {
        var ciclo = kmProximaTroca - kmInicio;
        if (ciclo <= 0) return 100;
        return Math.Clamp((int)Math.Round(100.0 * (kmAtual - kmInicio) / ciclo), 0, 100);
    }

    // Sem histórico no sistema: usa o km de amaciamento (IntervaloKmPrimeira; 0 = igual ao padrão).
    // Se o veículo já passou dele, assume ciclos regulares desde então e aponta o próximo múltiplo.
    private static (int kmProximaTroca, bool isPrimeira) CalcularSemHistorico(int kmAtual, int intervaloKm, int intervaloKmPrimeira)
    {
        var limiarPrimeira = intervaloKmPrimeira > 0 ? intervaloKmPrimeira : intervaloKm;
        if (kmAtual < limiarPrimeira) return (limiarPrimeira, true);
        if (intervaloKm <= 0) return (limiarPrimeira, false); // intervalo inválido: evita divisão por zero

        var ciclos = (kmAtual - limiarPrimeira) / intervaloKm + 1;
        return (limiarPrimeira + ciclos * intervaloKm, false);
    }
}
