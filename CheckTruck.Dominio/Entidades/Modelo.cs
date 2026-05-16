using System.ComponentModel.DataAnnotations;

namespace CheckTruck.Dominio.Entidades;

public class Modelo
{
    public long Id { get; set; }
    [Required]
    public string Nome { get; set; }
    [Required]
    public GeracaoModelo Geracao { get; set; }
    public int PotenciaCavalo { get; set; }
    public int EixoDianteiroPneus { get; set; }
    public int EixoTraseiroTandem { get; set; }
    public int PneusPorEixoTraseiro { get; set; }
    public IList<IntervaloRecomendado> IntervaloRecomendados { get; set; } = new List<IntervaloRecomendado>();
}