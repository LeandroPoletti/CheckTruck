using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class GeracaoConfiguration : IEntityTypeConfiguration<Geracao>
{
    public void Configure(EntityTypeBuilder<Geracao> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Nome).IsRequired().HasMaxLength(100);
        builder.Property(g => g.Motor).HasMaxLength(100);
        builder.Property(g => g.Caixa).HasMaxLength(100);
        builder.HasOne(g => g.Modelo).WithMany(m => m.Geracoes)
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
    }
}