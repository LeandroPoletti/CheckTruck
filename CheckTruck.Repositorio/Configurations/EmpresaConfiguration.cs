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
        builder.Property(e => e.TipoConta).IsRequired();

        // CNPJ (14) ou CPF (11), sem máscara: uma conta por documento
        builder.Property(e => e.Documento).HasMaxLength(14);
        builder.HasIndex(e => e.Documento).IsUnique();
    }
}
