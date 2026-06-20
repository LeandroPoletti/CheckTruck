using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class IntervaloRecomendado : EntidadeBanco
{
    public long Id { get; set; }
    [Required]
    public Modelo Modelo { get; set; }
    [Required]
    public TipoManutencao TipoManutencao { get; set; }
    public int IntervaloKm { get; set; }
    public int IntervaloKmPrimeira { get; set; }
    public string Fonte { get; set; }
    public string Observacao { get; set; }
}