using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>Um item trocado na OS (ex.: óleo do motor) e quando ele vence de novo.</summary>
public class ItemOrdemServico : EntidadeDaEmpresa
{
    public long Id { get; set; }
    public OrdemServico OrdemServico { get; set; } = null!;
    public TipoManutencao TipoManutencao { get; set; } = null!;
    public int KmProximaTroca { get; set; }
    public DateTime? DataProximaTroca { get; set; }
    public bool IsPrimeiraTroca { get; set; }
}
