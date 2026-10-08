using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class VeiculoConfiguration : IEntityTypeConfiguration<Veiculo>
{
    public void Configure(EntityTypeBuilder<Veiculo> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Placa).IsRequired();
        builder.HasIndex(v => v.Placa).IsUnique();
        
        builder.Property(v => v.Chassi).IsRequired().HasMaxLength(17);
        builder.HasIndex(v => v.Chassi).IsUnique();
        
        builder.Property(v => v.KmAtual).IsRequired();
        
        builder.HasOne(v => v.Potencia).WithMany(p => p.Veiculos)
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(v => v.MotoristaAtual).WithMany()
            .HasForeignKey("MotoristaAtualId")
            .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
    }   
}
