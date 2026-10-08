using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Lançamento das trocas feitas pela concessionária (OS). Se a OS ou a etiqueta trouxer a próxima
/// troca, vale o que veio; se não, o sistema calcula pelo intervalo do caminhão → geração → padrão.
/// O km da OS também atualiza o km do caminhão quando é maior que o atual, e o motorista informado
/// ao lançar vira o motorista atual do caminhão.
/// </summary>
public class ServicoManutencao(
    IRepositorioCrud repositorioCrud,
    ServicoSituacaoVeiculo servicoSituacao,
    ILogger<ServicoManutencao> logger) : ServicoCrud<Manutencao>(repositorioCrud, logger)
{
    public override bool Valida(Manutencao entidade)
    {
        if (entidade.KmAtual < 0)
        {
            Mensagens.Add("O km da troca não pode ser negativo.");
        }

        if (entidade.KmProximaTroca > 0 && entidade.KmProximaTroca <= entidade.KmAtual)
        {
            Mensagens.Add("O km da próxima troca precisa ser maior que o km da troca.");
        }

        if (entidade.DataProximaTroca is { } dataProxima && dataProxima <= entidade.RealizadoEm)
        {
            Mensagens.Add("A data da próxima troca precisa ser depois da data da troca.");
        }

        return base.Valida(entidade);
    }

    public override Manutencao? Inserir(Manutencao entidade)
    {
        if (!PreencherProximaTroca(entidade) || !Valida(entidade))
        {
            return null;
        }

        AtualizarKmDoVeiculo(entidade);
        AtualizarMotoristaDoVeiculo(entidade);
        return base.Inserir(entidade);
    }

    public override Manutencao? Atualizar(Manutencao entidade)
    {
        if (!PreencherProximaTroca(entidade) || !Valida(entidade))
        {
            return null;
        }

        AtualizarKmDoVeiculo(entidade);
        return base.Atualizar(entidade);
    }

    /// <summary>
    /// Completa o km e a data da próxima troca que não vieram preenchidos (km &lt;= 0 ou data nula).
    /// </summary>
    public bool PreencherProximaTroca(Manutencao entidade)
    {
        if (entidade.KmProximaTroca > 0 && entidade.DataProximaTroca is not null)
        {
            return true;
        }

        if (entidade.Veiculo is null || entidade.TipoManutencao is null)
        {
            Mensagens.Add("Veículo e tipo de manutenção são obrigatórios.");
            return false;
        }

        var intervalo = servicoSituacao.ResolverIntervalo(entidade.Veiculo.Id, entidade.TipoManutencao.Id);
        if (intervalo is null)
        {
            if (entidade.KmProximaTroca > 0)
            {
                return true; // km veio da OS; sem intervalo cadastrado, fica sem prazo
            }

            Mensagens.Add("Não há intervalo cadastrado para esse item. Informe o km da próxima troca ou cadastre o intervalo.");
            return false;
        }

        if (entidade.KmProximaTroca <= 0)
        {
            entidade.KmProximaTroca = entidade.KmAtual + intervalo.IntervaloKm;
        }

        entidade.DataProximaTroca ??= ServicoSituacaoVeiculo.CalcularDataProximaTroca(entidade.RealizadoEm, intervalo.IntervaloMeses);
        return true;
    }

    // A OS é uma leitura do painel: se o km dela for maior que o do cadastro, atualiza o caminhão.
    private static void AtualizarKmDoVeiculo(Manutencao entidade)
    {
        if (entidade.Veiculo is not null && entidade.KmAtual > entidade.Veiculo.KmAtual)
        {
            entidade.Veiculo.KmAtual = entidade.KmAtual;
        }
    }

    // Só no lançamento: corrigir uma OS antiga não muda quem está com o caminhão agora.
    // Sem motorista na OS, o caminhão continua com o que já tinha.
    private static void AtualizarMotoristaDoVeiculo(Manutencao entidade)
    {
        if (entidade.Motorista is not null)
        {
            entidade.Veiculo.MotoristaAtual = entidade.Motorista;
        }
    }
}
