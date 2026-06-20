using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class GeracaoModelo : EntidadeBanco
{
    public long Id { get; set; }
    [Required]
    public string Nome { get; set; }
    [Required]
    public Fabricante Fabricante { get; set; }
    public string Motor { get; set; }
    public string NormaEmissao { get; set; }
    public string Caixa { get; set; }
    public DateTime AnoInicio { get; set; }
    public DateTime? AnoFim { get; set; }
    public IList<Modelo> Modelos { get; set; } = new List<Modelo>();
}