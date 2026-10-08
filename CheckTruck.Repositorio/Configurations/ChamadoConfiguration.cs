using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class ChamadoConfiguration : IEntityTypeConfiguration<Chamado>
{
    public void Configure(EntityTypeBuilder<Chamado> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Descricao).IsRequired().HasMaxLength(1000);
        builder.Property(c => c.Solucao).HasMaxLength(1000);
        builder.HasIndex(c => c.Status);

        builder.HasOne(c => c.Veiculo).WithMany()
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(c => c.AbertoPor).WithMany()
            .HasForeignKey("AbertoPorId")
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(c => c.AtendidoPor).WithMany()
            .HasForeignKey("AtendidoPorId")
            .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
    }
}
