using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>Potência (cv) em que uma geração foi vendida. O caminhão aponta para uma delas.</summary>
public class Potencia : ItemDoCatalogo
{
    public long Id { get; set; }
    /// <summary>null = do catálogo do sistema; senão, a empresa que cadastrou (só ela vê).</summary>
    public long? EmpresaId { get; set; }
    public int Cv { get; set; }
    [Required]
    public Geracao Geracao { get; set; } = null!;
    public IList<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
}
