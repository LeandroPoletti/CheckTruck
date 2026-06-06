using CheckTruck.Dominio.Entidades;
using CheckTruck.Repositorio.Entidades;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Repositorio;

public class Context : IdentityDbContext<Usuario>
{
    public DbSet<Fabricante> Fabricantes { get; set; }
    public DbSet<GeracaoModelo> GeracaoModelos { get; set; }
    public DbSet<Modelo> Modelos { get; set; }
    public DbSet<Pais> Paises { get; set; }
    public DbSet<TipoManutencao> TiposManutencao { get; set; }
    public DbSet<Veiculo> Veiculos { get; set; }
    public DbSet<Manutencao> Manutencoes { get; set; }
    public DbSet<IntervaloRecomendado> IntervalosRecomendados { get; set; }

    public Context(DbContextOptions options) : base(options)
    {
        
    }
    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(Context).Assembly);
        base.OnModelCreating(builder);
    }
}