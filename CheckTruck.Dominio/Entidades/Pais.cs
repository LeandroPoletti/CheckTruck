using System.ComponentModel.DataAnnotations;

namespace CheckTruck.Dominio.Entidades;

public class Pais
{
    public long Id { get; set; }
    [Required]
    public string Nome { get; set; }
    public IList<Fabricante> Fabricantes { get; set; } = new List<Fabricante>();
}