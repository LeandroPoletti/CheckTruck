using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>Linha (família) de caminhões de um fabricante. Ex.: Volvo FH, FM, FMX, VM; Scania R, G, P, S.</summary>
public class Modelo : ItemDoCatalogo
{
    public long Id { get; set; }
    /// <summary>null = do catálogo do sistema; senão, a empresa que cadastrou (só ela vê).</summary>
    public long? EmpresaId { get; set; }
    [Required]
    public string Nome { get; set; }
    [Required]
    public Fabricante Fabricante { get; set; }
    public IList<Geracao> Geracoes { get; set; } = new List<Geracao>();
}