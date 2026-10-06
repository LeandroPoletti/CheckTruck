using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class ManutencaoConfiguration : IEntityTypeConfiguration<Manutencao>
{
    public void Configure(EntityTypeBuilder<Manutencao> builder)
    {
        builder.HasKey(m => m.Id);
        builder.HasOne(m => m.Veiculo).WithMany(v => v.Manutencoes).IsRequired();
        builder.HasOne(m => m.TipoManutencao).WithMany().IsRequired();
        builder.Property(m => m.NumNotaFiscal).IsRequired();
        builder.HasOne(m => m.Mecanico).WithMany()
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.Property(m => m.LancadoPor).IsRequired().HasMaxLength(256);
        builder.Property(m => m.Concessionaria).IsRequired(false);
        builder.Property(m => m.Observacao).IsRequired(false);
    }
}
