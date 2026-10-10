using CheckTruck.Dominio.Enums;

namespace CheckTruck.Dominio.Resultados;

public class SituacaoFrota
{
    public int FrotaAtiva { get; set; }
    public int MargemAlertaKm { get; set; }
    public int MargemAlertaDias { get; set; }
    public int QuantidadeOk { get; set; }
    public int QuantidadeAtencao { get; set; }
    public int QuantidadeCritico { get; set; }
    public IList<AlertaManutencao> Alertas { get; set; } = new List<AlertaManutencao>();
    public IList<QuantidadePorGeracao> FrotaPorGeracao { get; set; } = new List<QuantidadePorGeracao>();
}

// Item mais urgente de um veículo que está em atenção ou crítico (por km ou por data).
public class AlertaManutencao
{
    public long VeiculoId { get; set; }
    public string Placa { get; set; } = "";
    public int KmAtual { get; set; }
    public string FabricanteNome { get; set; } = "";
    public string ModeloNome { get; set; } = "";
    public string GeracaoNome { get; set; } = "";
    public long TipoManutencaoId { get; set; }
    public string TipoManutencaoNome { get; set; } = "";
    public int KmProximaTroca { get; set; }
    public int KmRestante { get; set; }
    public int PercentualUsado { get; set; }
    public DateTime? DataProximaTroca { get; set; }
    public int? DiasRestantes { get; set; }
    public bool IsPrimeiraTroca { get; set; }
    public StatusManutencao Status { get; set; }
}

public class QuantidadePorGeracao
{
    public long GeracaoId { get; set; }
    public string GeracaoNome { get; set; } = "";
    public string ModeloNome { get; set; } = "";
    public string FabricanteNome { get; set; } = "";
    public int Quantidade { get; set; }
}
