namespace CheckTruck.Dominio.Entidades;

public class Fabricante
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public Pais PaisOrigem { get; set; }
    public IList<GeracaoModelo> Geracoes { get; set; } = new List<GeracaoModelo>();
}