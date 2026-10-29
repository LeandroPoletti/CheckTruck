using CheckTruck.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CheckTruck.Repositorio.Configurations;

public class OrdemServicoConfiguration : IEntityTypeConfiguration<OrdemServico>
{
    public void Configure(EntityTypeBuilder<OrdemServico> builder)
    {
        builder.HasKey(o => o.Id);
        // O número não repete dentro da empresa (cada uma tem a sua sequência)
        builder.HasIndex(Context.ColunaEmpresa, nameof(OrdemServico.Numero)).IsUnique();
        // Caminhão com OS não é apagado, nem direto no banco: o histórico de manutenção fica
        builder.HasOne(o => o.Veiculo).WithMany(v => v.OrdensServico)
            .IsRequired().OnDelete(DeleteBehavior.Restrict);
        // Os itens são parte da OS: excluir a OS leva os itens junto
        builder.HasMany(o => o.Itens).WithOne(i => i.OrdemServico)
            .IsRequired().OnDelete(DeleteBehavior.Cascade);
        // Mecânicos da OS (tabela de ligação). Mecânico com OS não é apagado; a OS excluída leva a ligação junto
        builder.HasMany(o => o.Mecanicos).WithMany()
            .UsingEntity<Dictionary<string, object>>(
                "OrdemServicoMecanico",
                mecanico => mecanico.HasOne<Mecanico>().WithMany().HasForeignKey("MecanicoId").OnDelete(DeleteBehavior.Restrict),
                ordem => ordem.HasOne<OrdemServico>().WithMany().HasForeignKey("OrdemServicoId").OnDelete(DeleteBehavior.Cascade));
        builder.HasOne(o => o.Motorista).WithMany()
            .HasForeignKey("MotoristaId")
            .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(o => o.LancadoPor).WithMany()
            .HasForeignKey("LancadoPorId")
            .IsRequired(false).OnDelete(DeleteBehavior.Restrict);
        builder.Property(o => o.Concessionaria).IsRequired(false).HasMaxLength(150);
        builder.Property(o => o.Observacao).IsRequired(false).HasMaxLength(500);
    }
}
