using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class PotenciaConfiguration : IEntityTypeConfiguration<Potencia>
{
    public void Configure(EntityTypeBuilder<Potencia> builder)
    {
        builder.HasKey(p => p.Id);
        // As potências saem junto com a geração (a geração com caminhão não pode ser excluída)
        builder.HasOne(p => p.Geracao).WithMany(g => g.Potencias)
            .HasForeignKey("GeracaoId")
            .IsRequired().OnDelete(DeleteBehavior.Cascade);
        // Cada geração tem cada potência uma vez só
        builder.HasIndex("GeracaoId", nameof(Potencia.Cv)).IsUnique();
    }
}
