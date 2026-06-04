using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class PaisConfiguration : IEntityTypeConfiguration<Pais>
{
    public void Configure(EntityTypeBuilder<Pais> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Nome).IsRequired().HasMaxLength(100);
        builder.HasMany(p => p.Fabricantes).WithOne(f => f.PaisOrigem);
    }
}