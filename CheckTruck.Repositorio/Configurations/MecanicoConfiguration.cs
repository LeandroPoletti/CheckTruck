using CheckTruck.Dominio.Entidades;
using CheckTruck.Repositorio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class MecanicoConfiguration : IEntityTypeConfiguration<Mecanico>
{
    public void Configure(EntityTypeBuilder<Mecanico> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Nome).IsRequired().HasMaxLength(150);
        builder.Property(m => m.Funcao).IsRequired().HasMaxLength(100);
        builder.Property(m => m.Ativo).IsRequired();

        // Login é opcional: só para quem for consultar pelo celular
        builder.Property(m => m.UsuarioGuid).IsRequired(false);
        builder.HasIndex(m => m.UsuarioGuid).IsUnique();
        builder.HasOne<Usuario>().WithOne(u => u.Mecanico)
            .HasForeignKey<Mecanico>(m => m.UsuarioGuid)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
