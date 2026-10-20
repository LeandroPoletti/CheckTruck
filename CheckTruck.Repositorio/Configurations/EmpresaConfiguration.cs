using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class EmpresaConfiguration : IEntityTypeConfiguration<Empresa>
{
    public void Configure(EntityTypeBuilder<Empresa> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Nome).IsRequired().HasMaxLength(150);

        // CNPJ (14) sem máscara; nas contas antigas de uma pessoa só, o CPF (11). Uma empresa por documento
        builder.Property(e => e.Documento).HasMaxLength(14);
        builder.HasIndex(e => e.Documento).IsUnique();
    }
}
