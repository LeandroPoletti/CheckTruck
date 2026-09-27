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
    public long? MotoristaId { get; set; }
    public string? MotoristaCpf { get; set; }

    /// <summary>Pior status entre os itens do veículo; sem intervalos cadastrados, Ok.</summary>
    public StatusManutencao Status { get; set; }

    /// <summary>Item com menor km restante; null quando o modelo não tem intervalos.</summary>
    public ItemManutencao? ItemMaisUrgente { get; set; }
}

public class ItemManutencao
{
    public long TipoManutencaoId { get; set; }
    public string TipoManutencaoNome { get; set; } = "";
    public int KmProximaTroca { get; set; }
    public int KmRestante { get; set; }
    public bool IsPrimeiraTroca { get; set; }
    public StatusManutencao Status { get; set; }
}
