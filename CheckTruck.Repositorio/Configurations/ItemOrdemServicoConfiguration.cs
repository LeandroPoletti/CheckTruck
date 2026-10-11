using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class ItemOrdemServicoConfiguration : IEntityTypeConfiguration<ItemOrdemServico>
{
    public void Configure(EntityTypeBuilder<ItemOrdemServico> builder)
    {
        builder.HasKey(i => i.Id);
        builder.HasOne(i => i.TipoManutencao).WithMany()
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        // Cada tipo de manutenção entra uma vez só em cada OS
        builder.HasIndex("OrdemServicoId", "TipoManutencaoId").IsUnique();
    }
}
