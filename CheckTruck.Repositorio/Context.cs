using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Repositorio;

public class Context : DbContext
{
    public DbSet<Fabricante> Fabricantes { get; set; }
    public DbSet<GeracaoModelo> GeracaoModelos { get; set; }
    public DbSet<Modelo> Modelos { get; set; }
    public DbSet<Pais> Paises { get; set; }
    public DbSet<TipoManutencao> TiposManutencao { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Veiculo> Veiculos { get; set; }
    public DbSet<Manutencao> Manutencoes { get; set; }
    public DbSet<IntervaloRecomendado> IntervalosRecomendados { get; set; }
    
    
}