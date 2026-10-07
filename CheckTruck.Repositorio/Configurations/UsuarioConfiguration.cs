using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.Property(u => u.Nome).IsRequired().HasMaxLength(150);

        // Só números; o admin do sistema fica sem CPF
        builder.Property(u => u.Cpf).HasMaxLength(11);
        builder.HasIndex(u => u.Cpf).IsUnique();
    }
}
