using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Api.Dtos.Veiculos;
using CheckTruck.Dominio.Resultados;

namespace CheckTruck.Api.Dtos.Dashboard;

public class DashboardResponseDto
{
    public int FrotaAtiva { get; set; }
    public ContagemStatusDto Contagem { get; set; }
    public IList<AlertaManutencaoDto> Alertas { get; set; }
    public IList<FrotaPorGeracaoDto> FrotaPorGeracao { get; set; }
}

/// <summary>Quantos itens (trocas acompanhadas) de toda a frota ativa estão em cada status.</summary>
public class ContagemStatusDto
{
    public int Ok { get; set; }
    public int Atencao { get; set; }
    public int Critico { get; set; }
}

public class AlertaManutencaoDto
{
    public long VeiculoId { get; set; }
    public string Placa { get; set; }
    public int KmAtual { get; set; }
    public string FabricanteNome { get; set; }
    public string ModeloNome { get; set; }
    public string GeracaoNome { get; set; }

    /// <summary>"atencao" ou "critico": o pior entre os itens.</summary>
    public string Status { get; set; }

    /// <summary>Itens em atenção ou crítico, do mais urgente para o menos urgente.</summary>
    public IList<ItemManutencaoDto> Itens { get; set; }
}

public class FrotaPorGeracaoDto
{
    public long GeracaoId { get; set; }
    public string GeracaoNome { get; set; }
    public string ModeloNome { get; set; }
    public string FabricanteNome { get; set; }
    public int Quantidade { get; set; }
}

public static class DashboardDtoExtensions
{
    public static DashboardResponseDto ToResponseDto(this SituacaoFrota situacao) => new()
    {
        FrotaAtiva = situacao.FrotaAtiva,
        Contagem = new ContagemStatusDto
        {
            Ok = situacao.QuantidadeOk,
            Atencao = situacao.QuantidadeAtencao,
            Critico = situacao.QuantidadeCritico
        },
        Alertas = situacao.Alertas.Select(a => new AlertaManutencaoDto
        {
            VeiculoId = a.VeiculoId,
            Placa = a.Placa,
            KmAtual = a.KmAtual,
            FabricanteNome = a.FabricanteNome,
            ModeloNome = a.ModeloNome,
            GeracaoNome = a.GeracaoNome,
            Status = a.Status.ToApiString(),
            Itens = a.Itens.Select(i => i.ToDto()).ToList()
        }).ToList(),
        FrotaPorGeracao = situacao.FrotaPorGeracao.Select(g => new FrotaPorGeracaoDto
        {
            GeracaoId = g.GeracaoId,
            GeracaoNome = g.GeracaoNome,
            ModeloNome = g.ModeloNome,
            FabricanteNome = g.FabricanteNome,
            Quantidade = g.Quantidade
        }).ToList()
    };
}
