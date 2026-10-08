using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>Intervalo de troca de um item para os caminhões de uma geração (ex.: manual do fabricante).</summary>
public class IntervaloRecomendado : EntidadeBanco
{
    public long Id { get; set; }
    [Required]
    public Geracao Geracao { get; set; }
    [Required]
    public TipoManutencao TipoManutencao { get; set; }
    public int IntervaloKm { get; set; }
    public int IntervaloKmPrimeira { get; set; }
    /// <summary>Prazo máximo entre trocas, em meses. 0 = vence só por km.</summary>
    public int IntervaloMeses { get; set; }
    public string Fonte { get; set; }
    public string Observacao { get; set; }
}