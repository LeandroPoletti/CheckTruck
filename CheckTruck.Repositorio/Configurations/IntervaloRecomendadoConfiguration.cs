using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class IntervaloRecomendadoConfiguration : IEntityTypeConfiguration<IntervaloRecomendado>
{
    public void Configure(EntityTypeBuilder<IntervaloRecomendado> builder)
    {
        builder.HasKey(i => i.Id);
        builder.HasOne(i => i.Modelo).WithMany(m => m.IntervaloRecomendados).IsRequired();
        builder.HasOne(i => i.TipoManutencao).WithMany(t => t.IntervaloRecomendados).IsRequired();
        builder.Property(i => i.IntervaloKm).IsRequired();
        builder.Property(i => i.IntervaloKmPrimeira).IsRequired();
    }
}