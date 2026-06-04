using CheckTruck.Dominio.Enums;

namespace CheckTruck.Dominio.Entidades;

public class TipoManutencao
{
    public long Id { get; set; }
    
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public Componente Componente { get; set; }
    public IList<IntervaloRecomendado> IntervaloRecomendados { get; set; } = new List<IntervaloRecomendado>();
}