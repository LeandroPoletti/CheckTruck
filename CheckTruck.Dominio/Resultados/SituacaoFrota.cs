using CheckTruck.Dominio.Enums;

namespace CheckTruck.Dominio.Resultados;

public class SituacaoFrota
{
    public int FrotaAtiva { get; set; }

    // Quantos itens (trocas acompanhadas) de toda a frota ativa estão em cada status
    public int QuantidadeOk { get; set; }
    public int QuantidadeAtencao { get; set; }
    public int QuantidadeCritico { get; set; }
    public IList<AlertaManutencao> Alertas { get; set; } = new List<AlertaManutencao>();
    public IList<QuantidadePorGeracao> FrotaPorGeracao { get; set; } = new List<QuantidadePorGeracao>();
}

// Caminhão em atenção ou crítico (por km ou por data) e os itens dele que precisam de cuidado.
public class AlertaManutencao
{
    public long VeiculoId { get; set; }
    public string Placa { get; set; } = "";
    public int KmAtual { get; set; }
    public string FabricanteNome { get; set; } = "";
    public string ModeloNome { get; set; } = "";
    public string GeracaoNome { get; set; } = "";

    /// <summary>O pior status entre os itens.</summary>
    public StatusManutencao Status { get; set; }

    /// <summary>Itens em atenção ou crítico, do mais urgente para o menos urgente.</summary>
    public IList<ItemManutencao> Itens { get; set; } = new List<ItemManutencao>();
}

public class QuantidadePorGeracao
{
    public long GeracaoId { get; set; }
    public string GeracaoNome { get; set; } = "";
    public string ModeloNome { get; set; } = "";
    public string FabricanteNome { get; set; } = "";
    public int Quantidade { get; set; }
}
