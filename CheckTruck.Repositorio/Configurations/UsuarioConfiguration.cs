using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.Property(u => u.Nome).IsRequired().HasMaxLength(150);

        builder.HasOne<Empresa>().WithMany().HasForeignKey(u => u.EmpresaId).OnDelete(DeleteBehavior.Restrict);

        // Só números; o admin do sistema fica sem CPF. Não repete dentro da empresa
        builder.Property(u => u.Cpf).HasMaxLength(11);
        builder.HasIndex(u => new { u.EmpresaId, u.Cpf }).IsUnique();
    }
}
