using CheckTruck.Dominio.Enums;

namespace CheckTruck.Dominio.Resultados;

// Veículo com os dados de exibição já resolvidos (modelo, geração, motorista) e a situação de manutenção.
public class SituacaoVeiculo
{
    public long VeiculoId { get; set; }
    public string Placa { get; set; } = "";
    public string Chassi { get; set; } = "";
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public DateTime AnoModelo { get; set; }
    public long ModeloId { get; set; }
    public string ModeloNome { get; set; } = "";
    public int PotenciaCavalo { get; set; }
    public long GeracaoId { get; set; }
    public string GeracaoNome { get; set; } = "";
    public string? NormaEmissao { get; set; }
    public string FabricanteNome { get; set; } = "";
    public string? MotoristaAtualId { get; set; }
    public string? MotoristaAtualNome { get; set; }

    /// <summary>Pior status entre os itens do veículo; sem itens, Ok.</summary>
    public StatusManutencao Status { get; set; }

    /// <summary>Item mais urgente (pior status; empate pelo menor km restante); null quando não há itens.</summary>
    public ItemManutencao? ItemMaisUrgente { get; set; }

    /// <summary>Todos os itens do veículo, do mais urgente para o menos urgente.</summary>
    public IList<ItemManutencao> Itens { get; set; } = new List<ItemManutencao>();
}

public class ItemManutencao
{
    public long TipoManutencaoId { get; set; }
    public string TipoManutencaoNome { get; set; } = "";

    /// <summary>Intervalo usado no cálculo e de onde ele veio (caminhão, modelo ou padrão).</summary>
    public int IntervaloKm { get; set; }
    public int IntervaloMeses { get; set; }
    public OrigemIntervalo OrigemIntervalo { get; set; }

    /// <summary>Última troca registrada desse item; null quando não há histórico no sistema.</summary>
    public DateTime? UltimaTrocaEm { get; set; }
    public int? UltimaTrocaKm { get; set; }

    public int KmProximaTroca { get; set; }
    public int KmRestante { get; set; }

    /// <summary>Data limite da próxima troca; null quando não há histórico ou o intervalo não tem prazo.</summary>
    public DateTime? DataProximaTroca { get; set; }
    public int? DiasRestantes { get; set; }

    public bool IsPrimeiraTroca { get; set; }

    /// <summary>Pior entre o status por km e o status por data.</summary>
    public StatusManutencao Status { get; set; }
}
