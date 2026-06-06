using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class GeracaoModeloConfiguration : IEntityTypeConfiguration<GeracaoModelo>
{
    public void Configure(EntityTypeBuilder<GeracaoModelo> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Nome).IsRequired().HasMaxLength(100);
        builder.HasOne(e => e.Fabricante).WithMany(f => f.Geracoes).IsRequired();
    }
}