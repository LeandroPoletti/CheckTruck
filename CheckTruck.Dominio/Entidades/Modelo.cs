namespace CheckTruck.Dominio.Entidades;

public class Modelo
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public GeracaoModelo Geracao { get; set; }
    public int PotenciaCavalo { get; set; }
    public int EixoDianteiroPneus { get; set; }
    public int EixoTraseiroTandem { get; set; }
    public int PneusPorEixoTraseiro { get; set; }
    public IList<IntervaloRecomendado> IntervaloRecomendados { get; set; } = new List<IntervaloRecomendado>();
}