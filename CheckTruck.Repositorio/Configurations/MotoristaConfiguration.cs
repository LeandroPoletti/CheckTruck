using CheckTruck.Dominio.Entidades;
using CheckTruck.Repositorio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class MotoristaConfiguration : IEntityTypeConfiguration<Motorista>
{
    public void Configure(EntityTypeBuilder<Motorista> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.UsuarioGuid).IsRequired();
        builder.HasIndex(m => m.UsuarioGuid).IsUnique();

        builder.Property(m => m.Cpf).IsRequired().HasMaxLength(14);
        
        builder.HasOne<Usuario>().WithOne(u => u.Motorista)
            .HasForeignKey<Motorista>(m => m.UsuarioGuid)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
