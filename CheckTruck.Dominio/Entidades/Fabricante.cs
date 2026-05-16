using System.ComponentModel.DataAnnotations;

namespace CheckTruck.Dominio.Entidades;

public class Fabricante
{
    public long Id { get; set; }
    [Required]
    public string Nome { get; set; }
    [Required]
    public Pais PaisOrigem { get; set; }
    public IList<GeracaoModelo> Geracoes { get; set; } = new List<GeracaoModelo>();
}