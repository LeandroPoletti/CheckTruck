using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Resultados;

namespace CheckTruck.Api.Dtos.Dashboard;

public class DashboardResponseDto
{
    public int FrotaAtiva { get; set; }
    public int MargemAlertaKm { get; set; }
    public int MargemAlertaDias { get; set; }
    public ContagemStatusDto Contagem { get; set; }
    public IList<AlertaManutencaoDto> Alertas { get; set; }
    public IList<FrotaPorGeracaoDto> FrotaPorGeracao { get; set; }
}

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
    public string ModeloNome { get; set; }
    public string GeracaoNome { get; set; }
    public long TipoManutencaoId { get; set; }
    public string TipoManutencaoNome { get; set; }
    public int KmProximaTroca { get; set; }
    public int KmRestante { get; set; }

    /// <summary>Data limite da próxima troca; null quando não há histórico ou o intervalo não tem prazo.</summary>
    public DateTime? DataProximaTroca { get; set; }

    /// <summary>Dias até a data limite (negativo = vencido); null quando não há data.</summary>
    public int? DiasRestantes { get; set; }

    public bool IsPrimeiraTroca { get; set; }

    /// <summary>"ok", "atencao" ou "critico"</summary>
    public string Status { get; set; }
}

public class FrotaPorGeracaoDto
{
    public long GeracaoId { get; set; }
    public string GeracaoNome { get; set; }
    public int Quantidade { get; set; }
}

public static class DashboardDtoExtensions
{
    public static DashboardResponseDto ToResponseDto(this SituacaoFrota situacao) => new()
    {
        FrotaAtiva = situacao.FrotaAtiva,
        MargemAlertaKm = situacao.MargemAlertaKm,
        MargemAlertaDias = situacao.MargemAlertaDias,
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
            ModeloNome = a.ModeloNome,
            GeracaoNome = a.GeracaoNome,
            TipoManutencaoId = a.TipoManutencaoId,
            TipoManutencaoNome = a.TipoManutencaoNome,
            KmProximaTroca = a.KmProximaTroca,
            KmRestante = a.KmRestante,
            DataProximaTroca = a.DataProximaTroca,
            DiasRestantes = a.DiasRestantes,
            IsPrimeiraTroca = a.IsPrimeiraTroca,
            Status = a.Status.ToApiString()
        }).ToList(),
        FrotaPorGeracao = situacao.FrotaPorGeracao.Select(g => new FrotaPorGeracaoDto
        {
            GeracaoId = g.GeracaoId,
            GeracaoNome = g.GeracaoNome,
            Quantidade = g.Quantidade
        }).ToList()
    };
}
