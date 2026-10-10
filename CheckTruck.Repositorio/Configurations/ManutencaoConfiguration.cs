using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class ManutencaoConfiguration : IEntityTypeConfiguration<Manutencao>
{
    public void Configure(EntityTypeBuilder<Manutencao> builder)
    {
        builder.HasKey(m => m.Id);
        // Caminhão com OS não é apagado, nem direto no banco: o histórico de manutenção fica
        builder.HasOne(m => m.Veiculo).WithMany(v => v.Manutencoes)
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(m => m.TipoManutencao).WithMany()
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(m => m.Mecanico).WithMany()
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(m => m.Motorista).WithMany()
            .HasForeignKey("MotoristaId")
            .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(m => m.LancadoPor).WithMany()
            .HasForeignKey("LancadoPorId")
            .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
        builder.Property(m => m.Concessionaria).IsRequired(false);
        builder.Property(m => m.Observacao).IsRequired(false);
    }
}
