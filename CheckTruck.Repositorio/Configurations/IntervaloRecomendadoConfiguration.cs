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

        // Para cada geração e item: um de fábrica (do sistema, sem empresa) e um por empresa
        builder.HasIndex("GeracaoId", "TipoManutencaoId").IsUnique()
            .HasFilter($"\"{Context.ColunaEmpresa}\" IS NULL");
        builder.HasIndex("GeracaoId", "TipoManutencaoId", Context.ColunaEmpresa).IsUnique()
            .HasFilter($"\"{Context.ColunaEmpresa}\" IS NOT NULL");
    }
}
