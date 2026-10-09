using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class RegistroKmConfiguration : IEntityTypeConfiguration<RegistroKm>
{
    public void Configure(EntityTypeBuilder<RegistroKm> builder)
    {
        builder.HasKey(r => r.Id);
        builder.HasOne(r => r.Veiculo).WithMany(v => v.RegistrosKm)
            .IsRequired().OnDelete(DeleteBehavior.Cascade);
        // Excluir a OS não apaga o histórico: o registro só perde o número da OS
        builder.HasOne(r => r.OrdemServico).WithMany()
            .HasForeignKey("OrdemServicoId")
            .IsRequired(false).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(r => r.RegistradoPor).WithMany()
            .HasForeignKey("RegistradoPorId")
            .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
        builder.Property(r => r.Motivo).HasMaxLength(200);
    }
}
