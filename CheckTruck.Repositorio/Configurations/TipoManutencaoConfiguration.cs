using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class TipoManutencaoConfiguration: IEntityTypeConfiguration<TipoManutencao>
{
    public void Configure(EntityTypeBuilder<TipoManutencao> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Nome).IsRequired().HasMaxLength(100);
    }
}