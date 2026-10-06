using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class IntervaloVeiculoConfiguration : IEntityTypeConfiguration<IntervaloVeiculo>
{
    public void Configure(EntityTypeBuilder<IntervaloVeiculo> builder)
    {
        builder.HasKey(i => i.Id);
        builder.HasOne(i => i.Veiculo).WithMany()
            .HasForeignKey("VeiculoId")
            .IsRequired().OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(i => i.TipoManutencao).WithMany()
            .HasForeignKey("TipoManutencaoId")
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.Property(i => i.IntervaloKm).IsRequired();
        builder.Property(i => i.IntervaloMeses).IsRequired();

        // Um intervalo próprio por item em cada caminhão
        builder.HasIndex("VeiculoId", "TipoManutencaoId").IsUnique();
    }
}
