using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class ModeloConfiguration : IEntityTypeConfiguration<Modelo>
{
    public void Configure(EntityTypeBuilder<Modelo> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Nome).IsRequired();
        builder.HasOne(m => m.Geracao).WithMany(g => g.Modelos).IsRequired();
        builder.HasMany(m => m.IntervaloRecomendados).WithOne(i => i.Modelo).IsRequired();
        builder.HasMany(m => m.Veiculos).WithOne(v => v.Modelo).IsRequired();
    }
}