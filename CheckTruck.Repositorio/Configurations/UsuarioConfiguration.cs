using CheckTruck.Repositorio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.HasMany(u => u.Manutencoes).WithOne().HasForeignKey(m => m.UsuarioGuid).IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(u => u.Veiculo).WithOne().HasForeignKey("MotoristaGuid").IsRequired().OnDelete(DeleteBehavior.SetNull);
    }
}