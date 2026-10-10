using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Repositorio;

// Só usuários do Identity (sem tabelas de papéis): quem pode o quê fica no cargo e nas permissões do Usuario
public class Context : IdentityUserContext<Usuario>
{
    /// <summary>
    /// Coluna com a empresa dona do registro: só no banco nas tabelas de <see cref="EntidadeDaEmpresa"/>,
    /// e propriedade (que pode ser null, do sistema) nas de <see cref="ItemDoCatalogo"/>.
    /// </summary>
    public const string ColunaEmpresa = "EmpresaId";

    private readonly IUsuarioLogado _usuarioLogado;

    public DbSet<Empresa> Empresas { get; set; }
    public DbSet<Fabricante> Fabricantes { get; set; }
    public DbSet<Modelo> Modelos { get; set; }
    public DbSet<Geracao> Geracoes { get; set; }
    public DbSet<Potencia> Potencias { get; set; }
    public DbSet<Pais> Paises { get; set; }
    public DbSet<TipoManutencao> TiposManutencao { get; set; }
    public DbSet<Veiculo> Veiculos { get; set; }
    public DbSet<Manutencao> Manutencoes { get; set; }
    public DbSet<IntervaloRecomendado> IntervalosRecomendados { get; set; }
    public DbSet<IntervaloVeiculo> IntervalosVeiculo { get; set; }
    public DbSet<RegistroKm> RegistrosKm { get; set; }
    public DbSet<Mecanico> Mecanicos { get; set; }
    public DbSet<Chamado> Chamados { get; set; }

    public Context(DbContextOptions options, IUsuarioLogado usuarioLogado) : base(options)
    {
        _usuarioLogado = usuarioLogado;
    }

    // Empresa de quem está logado. null: dono do sistema, ou ninguém logado (como nos seeds)
    private long? EmpresaDoUsuario => _usuarioLogado.Usuario?.EmpresaId;

    // Para os filtros: sem empresa fica 0, e nenhum dado de empresa aparece
    private long EmpresaAtualId => EmpresaDoUsuario ?? 0;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Antes das configurações das tabelas: os índices de placa e chassi usam a coluna da empresa
        DaEmpresa<Veiculo>(builder);
        DaEmpresa<Manutencao>(builder);
        DaEmpresa<Chamado>(builder);
        DaEmpresa<Mecanico>(builder);
        DaEmpresa<IntervaloVeiculo>(builder);
        DaEmpresa<RegistroKm>(builder);

        DoCatalogo<Pais>(builder);
        DoCatalogo<Fabricante>(builder);
        DoCatalogo<Modelo>(builder);
        DoCatalogo<Geracao>(builder);
        DoCatalogo<Potencia>(builder);
        DoCatalogo<TipoManutencao>(builder);
        DoCatalogo<IntervaloRecomendado>(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(Context).Assembly);
        base.OnModelCreating(builder);
    }

    // Toda consulta da tabela só traz a empresa de quem está logado (global query filter),
    // e todo UPDATE e DELETE leva a empresa no WHERE (concurrency token)
    private void DaEmpresa<T>(ModelBuilder builder) where T : class, EntidadeDaEmpresa
    {
        var entidade = builder.Entity<T>();
        entidade.Property<long>(ColunaEmpresa).IsConcurrencyToken();
        entidade.HasOne<Empresa>().WithMany().HasForeignKey(ColunaEmpresa).OnDelete(DeleteBehavior.Restrict);
        entidade.HasQueryFilter(e => EF.Property<long>(e, ColunaEmpresa) == EmpresaAtualId);
    }

    // Item do catálogo: as consultas trazem o do sistema (sem empresa) e o da empresa de quem está logado,
    // e todo UPDATE e DELETE leva o dono do item no WHERE
    private void DoCatalogo<T>(ModelBuilder builder) where T : class, ItemDoCatalogo
    {
        var entidade = builder.Entity<T>();
        entidade.Property<long?>(ColunaEmpresa).IsConcurrencyToken();
        entidade.HasOne<Empresa>().WithMany().HasForeignKey(ColunaEmpresa).OnDelete(DeleteBehavior.Restrict);
        entidade.HasQueryFilter(e =>
            EF.Property<long?>(e, ColunaEmpresa) == null || EF.Property<long?>(e, ColunaEmpresa) == EmpresaAtualId);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        GravarEmpresa();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        GravarEmpresa();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    // A empresa nunca vem do front. Registro novo ganha a empresa de quem está logado; item do catálogo
    // cadastrado pelo dono do sistema (ou pelos seeds) fica sem empresa, do sistema. Alterar ou excluir só
    // pega registro do mesmo dono: ele vai no WHERE, e se o id for de outro o banco não acha a linha
    private void GravarEmpresa()
    {
        foreach (var entrada in ChangeTracker.Entries())
        {
            var daEmpresa = entrada.Entity is EntidadeDaEmpresa;
            if ((!daEmpresa && entrada.Entity is not ItemDoCatalogo)
                || entrada.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted))
            {
                continue;
            }

            if (daEmpresa && EmpresaDoUsuario is null)
            {
                throw new InvalidOperationException("Esse dado é de uma empresa: só quem é de uma empresa pode gravar.");
            }

            var empresa = entrada.Property(ColunaEmpresa);
            empresa.CurrentValue = EmpresaDoUsuario;
            if (entrada.State != EntityState.Added)
            {
                empresa.OriginalValue = EmpresaDoUsuario;
                empresa.IsModified = false;
            }
        }
    }
}
