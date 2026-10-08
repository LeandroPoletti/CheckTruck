using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>Potência (cv) em que uma geração foi vendida. O caminhão aponta para uma delas.</summary>
public class Potencia : EntidadeBanco
{
    public long Id { get; set; }
    public int Cv { get; set; }
    [Required]
    public Geracao Geracao { get; set; } = null!;
    public IList<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
}
