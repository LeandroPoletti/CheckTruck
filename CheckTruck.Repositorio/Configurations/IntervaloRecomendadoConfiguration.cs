using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class IntervaloRecomendadoConfiguration : IEntityTypeConfiguration<IntervaloRecomendado>
{
    public void Configure(EntityTypeBuilder<IntervaloRecomendado> builder)
    {
        builder.HasKey(i => i.Id);
        builder.HasOne(i => i.Geracao).WithMany(g => g.IntervalosRecomendados)
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(i => i.TipoManutencao).WithMany(t => t.IntervaloRecomendados)
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.Property(i => i.IntervaloKm).IsRequired();
        builder.Property(i => i.IntervaloKmPrimeira).IsRequired();
        builder.Property(i => i.IntervaloMeses).IsRequired();
    }
}
