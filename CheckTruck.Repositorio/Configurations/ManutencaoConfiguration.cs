using CheckTruck.Dominio.Entidades;
using CheckTruck.Repositorio.Entidades;
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
        builder.Property(m => m.Concessionaria).IsRequired();
        builder.HasOne<Usuario>().WithMany(u => u.Manutencoes).HasForeignKey(m => m.UsuarioGuid)
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
    }
}