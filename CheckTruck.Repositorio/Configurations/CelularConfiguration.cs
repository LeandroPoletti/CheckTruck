using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class CelularConfiguration : IEntityTypeConfiguration<Celular>
{
    public void Configure(EntityTypeBuilder<Celular> builder)
    {
        builder.HasKey(c => c.Id);
        // Um celular é de uma pessoa só (a que entrou nele por último)
        builder.Property(c => c.Token).IsRequired().HasMaxLength(Celular.TamanhoDoToken);
        builder.HasIndex(c => c.Token).IsUnique();
        builder.HasOne(c => c.Usuario).WithMany()
            .HasForeignKey("UsuarioId")
            .IsRequired().OnDelete(DeleteBehavior.Cascade);
    }
}
