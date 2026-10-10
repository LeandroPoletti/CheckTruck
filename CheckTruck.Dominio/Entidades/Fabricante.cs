using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class Fabricante : ItemDoCatalogo
{
    public long Id { get; set; }
    /// <summary>null = do catálogo do sistema; senão, a empresa que cadastrou (só ela vê).</summary>
    public long? EmpresaId { get; set; }
    [Required]
    public string Nome { get; set; }
    [Required]
    public Pais PaisOrigem { get; set; }
    public IList<Modelo> Modelos { get; set; } = new List<Modelo>();
}