using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Época de um modelo no Brasil (ex.: Volvo FH "Novo FH (FH 4)", ano-modelo 2015 a 2021, Euro 5, D13C).
/// Os intervalos recomendados ficam na geração, e cada geração tem as potências em que foi vendida.
/// </summary>
public class Geracao : EntidadeBanco
{
    public long Id { get; set; }
    [Required]
    public string Nome { get; set; }
    [Required]
    public Modelo Modelo { get; set; }
    /// <summary>Primeiro ano-modelo vendido no Brasil.</summary>
    public int AnoInicio { get; set; }
    /// <summary>Último ano-modelo; null = ainda é vendida.</summary>
    public int? AnoFim { get; set; }
    public NormaEmissao NormaEmissao { get; set; }
    public string? Motor { get; set; }
    public string? Caixa { get; set; }
    public IList<Potencia> Potencias { get; set; } = new List<Potencia>();
    public IList<IntervaloRecomendado> IntervalosRecomendados { get; set; } = new List<IntervaloRecomendado>();
}