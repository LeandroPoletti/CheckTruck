using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class TipoManutencao : ItemDoCatalogo
{
    public long Id { get; set; }
    /// <summary>null = do catálogo do sistema; senão, a empresa que cadastrou (só ela vê).</summary>
    public long? EmpresaId { get; set; }
    
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public Componente Componente { get; set; }
    public IList<IntervaloRecomendado> IntervaloRecomendados { get; set; } = new List<IntervaloRecomendado>();
}