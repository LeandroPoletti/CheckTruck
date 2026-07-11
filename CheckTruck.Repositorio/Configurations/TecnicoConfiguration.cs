using CheckTruck.Dominio.Entidades;
using CheckTruck.Repositorio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class TecnicoConfiguration : IEntityTypeConfiguration<Tecnico>
{
    public void Configure(EntityTypeBuilder<Tecnico> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.UsuarioGuid).IsRequired();
        builder.HasIndex(t => t.UsuarioGuid).IsUnique();

        builder.Property(t => t.Cpf).IsRequired().HasMaxLength(14);
        
        builder.HasOne<Usuario>().WithOne(u => u.Tecnico)
            .HasForeignKey<Tecnico>(t => t.UsuarioGuid)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
