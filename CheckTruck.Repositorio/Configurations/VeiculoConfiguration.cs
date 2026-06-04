using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class VeiculoConfiguration : IEntityTypeConfiguration<Veiculo>
{
    public void Configure(EntityTypeBuilder<Veiculo> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Placa).IsRequired();
        builder.Property(v => v.Chassi).IsRequired().HasMaxLength(17);
        builder.HasOne(v => v.Modelo).WithMany(m => m.Veiculos).IsRequired();
        builder.HasMany(v => v.Manutencoes).WithOne(m => m.Veiculo).IsRequired();
    }
}