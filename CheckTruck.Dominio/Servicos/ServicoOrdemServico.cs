using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Util;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Lançamento das trocas feitas pela concessionária (OS). Uma OS tem um ou mais itens trocados e um ou
/// mais mecânicos. Se a OS ou a etiqueta trouxer a próxima troca de um item, vale o que veio; se não, o
/// sistema calcula pelo intervalo do caminhão → empresa → fábrica → padrão.
/// O km da OS também atualiza o km do caminhão quando é maior que o atual (e fica no histórico de km),
/// e o motorista informado ao lançar vira o motorista atual do caminhão.
/// </summary>
public class ServicoOrdemServico(
    IRepositorioCrud repositorioCrud,
    ServicoSituacaoVeiculo servicoSituacao,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoOrdemServico> logger) : ServicoCrud<OrdemServico>(repositorioCrud, logger)
{
    public override bool Valida(OrdemServico entidade)
    {
        if (entidade.KmAtual < 0)
        {
            Mensagens.Add("O km da troca não pode ser negativo.");
        }

        // A troca já foi feita: a data não pode ser depois de hoje (nem antes de 1900)
        if (entidade.RealizadoEm.Year < AnoUtil.AnoMinimo || entidade.RealizadoEm.Date > DateTime.UtcNow.Date)
        {
            Mensagens.Add($"A data da troca vai de {AnoUtil.AnoMinimo} até hoje.");
        }

        if (entidade.Itens.Count == 0)
        {
            Mensagens.Add("Escolha pelo menos um item trocado.");
        }

        if (entidade.Mecanicos.Count == 0)
        {
            Mensagens.Add("Escolha pelo menos um mecânico.");
        }

        foreach (var item in entidade.Itens)
        {
            if (item.KmProximaTroca > 0 && item.KmProximaTroca <= entidade.KmAtual)
            {
                Mensagens.Add($"{item.TipoManutencao.Nome}: o km da próxima troca precisa ser maior que o km da troca.");
            }

            if (item.DataProximaTroca is { } dataProxima && dataProxima <= entidade.RealizadoEm)
            {
                Mensagens.Add($"{item.TipoManutencao.Nome}: a data da próxima troca precisa ser depois da data da troca.");
            }
        }

        return base.Valida(entidade);
    }

    /// <summary>Lança a OS: quem lançou e quando ficam gravados. Os mecânicos e o motorista precisam estar ativos.</summary>
    public override OrdemServico? Inserir(OrdemServico entidade)
    {
        ConferirAtivos(entidade);
        if (!PreencherProximaTroca(entidade) || !Valida(entidade))
        {
            return null;
        }

        entidade.LancadoPor = usuarioLogado.Usuario;
        entidade.CriadoEm = DateTime.UtcNow;
        AtualizarKmDoVeiculo(entidade);
        AtualizarMotoristaDoVeiculo(entidade);
        return base.Inserir(entidade);
    }

    /// <summary>
    /// Corrige uma OS já lançada (a API já trocou nela o que veio na correção: itens, mecânicos, km...).
    /// Quem lançou e quando continuam os originais, e a hora da correção fica gravada. Mecânicos e motorista
    /// podem estar inativos (a OS pode ser antiga), e o motorista do caminhão não muda.
    /// </summary>
    public override OrdemServico? Atualizar(OrdemServico entidade)
    {
        entidade.AtualizadoEm = DateTime.UtcNow;
        if (!PreencherProximaTroca(entidade) || !Valida(entidade))
        {
            return null;
        }

        AtualizarKmDoVeiculo(entidade);
        return base.Atualizar(entidade);
    }

    /// <summary>
    /// Completa o km e a data da próxima troca de cada item que não vieram preenchidos (km &lt;= 0 ou data nula).
    /// </summary>
    private bool PreencherProximaTroca(OrdemServico entidade)
    {
        foreach (var item in entidade.Itens)
        {
            if (item.KmProximaTroca > 0 && item.DataProximaTroca is not null)
            {
                continue;
            }

            var intervalo = servicoSituacao.ResolverIntervalo(entidade.Veiculo.Id, item.TipoManutencao.Id);
            if (intervalo is null)
            {
                if (item.KmProximaTroca > 0)
                {
                    continue; // km veio da OS; sem intervalo cadastrado, fica sem prazo
                }

                Mensagens.Add($"Não há intervalo cadastrado para {item.TipoManutencao.Nome}. Informe o km da próxima troca ou cadastre o intervalo.");
                return false;
            }

            if (item.KmProximaTroca <= 0)
            {
                item.KmProximaTroca = entidade.KmAtual + intervalo.IntervaloKm;
            }

            item.DataProximaTroca ??= ServicoSituacaoVeiculo.CalcularDataProximaTroca(entidade.RealizadoEm, intervalo.IntervaloMeses);
        }

        return true;
    }

    // Ao lançar, os mecânicos e o motorista precisam estar ativos
    private void ConferirAtivos(OrdemServico entidade)
    {
        foreach (var mecanico in entidade.Mecanicos.Where(m => !m.Ativo))
        {
            Mensagens.Add($"O mecânico {mecanico.Nome} está inativo. Ative o cadastro ou escolha outro.");
        }

        if (entidade.Motorista is { } motorista && !ServicoUsuario.EhMotoristaAtivo(motorista))
        {
            Mensagens.Add("Esse motorista está inativo. Escolha outro ou deixe sem motorista.");
        }
    }

    // A OS é uma leitura do painel: se o km dela for maior que o do cadastro, atualiza o caminhão
    // e guarda no histórico de km, ligado ao número da OS.
    private void AtualizarKmDoVeiculo(OrdemServico entidade)
    {
        if (entidade.KmAtual > entidade.Veiculo.KmAtual)
        {
            entidade.Veiculo.RegistrosKm.Add(ServicoVeiculo.NovoRegistroKm(
                entidade.Veiculo.KmAtual, entidade.KmAtual, OrigemKm.OrdemServico, usuarioLogado.Usuario, ordemServico: entidade));
            entidade.Veiculo.KmAtual = entidade.KmAtual;
        }
    }

    // Só no lançamento: corrigir uma OS antiga não muda quem está com o caminhão agora.
    // Sem motorista na OS, o caminhão continua com o que já tinha.
    private static void AtualizarMotoristaDoVeiculo(OrdemServico entidade)
    {
        if (entidade.Motorista is not null)
        {
            entidade.Veiculo.MotoristaAtual = entidade.Motorista;
        }
    }
}
