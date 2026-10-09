using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Intervalo próprio de um caminhão, para quando ele tem um plano diferente do padrão da geração
/// (ex.: plano da concessionária). Quando existe, tem prioridade sobre o IntervaloRecomendado.
/// </summary>
public class IntervaloVeiculo : EntidadeDaEmpresa
{
    public long Id { get; set; }
    [Required]
    public Veiculo Veiculo { get; set; } = null!;
    [Required]
    public TipoManutencao TipoManutencao { get; set; } = null!;
    public int IntervaloKm { get; set; }
    /// <summary>Prazo máximo entre trocas, em meses. 0 = vence só por km.</summary>
    public int IntervaloMeses { get; set; }
    public string? Observacao { get; set; }
}
