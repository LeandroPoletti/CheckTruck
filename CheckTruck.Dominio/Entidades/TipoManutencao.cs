using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class TipoManutencao : EntidadeBanco
{
    public long Id { get; set; }
    
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public Componente Componente { get; set; }
    public IList<IntervaloRecomendado> IntervaloRecomendados { get; set; } = new List<IntervaloRecomendado>();
}