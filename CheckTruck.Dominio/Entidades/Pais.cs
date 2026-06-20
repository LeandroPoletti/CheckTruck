using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class Pais : EntidadeBanco
{
    public long Id { get; set; }
    [Required]
    public string Nome { get; set; }
    public IList<Fabricante> Fabricantes { get; set; } = new List<Fabricante>();
}