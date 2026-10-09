using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Repositorio;

// Só usuários do Identity (sem tabelas de papéis): quem pode o quê fica no cargo e nas permissões do Usuario
public class Context : IdentityUserContext<Usuario>
{
    /// <summary>Coluna (só no banco) com a empresa dona do registro, nas tabelas de <see cref="EntidadeDaEmpresa"/>.</summary>
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

    // Empresa de quem está logado. Sem ninguém logado fica 0: nenhum dado de empresa aparece
    private long EmpresaAtualId => _usuarioLogado.Usuario?.EmpresaId ?? 0;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Antes das configurações das tabelas: os índices de placa e chassi usam a coluna da empresa
        DaEmpresa<Veiculo>(builder);
        DaEmpresa<Manutencao>(builder);
        DaEmpresa<Chamado>(builder);
        DaEmpresa<Mecanico>(builder);
        DaEmpresa<IntervaloVeiculo>(builder);
        DaEmpresa<RegistroKm>(builder);

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

    // A empresa nunca vem do front: registro novo ganha a de quem está logado, e alterar ou excluir só
    // pega registro dessa empresa (se o id for de outra, o banco não acha a linha e nada muda)
    private void GravarEmpresa()
    {
        foreach (var entrada in ChangeTracker.Entries<EntidadeDaEmpresa>())
        {
            if (entrada.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted))
            {
                continue;
            }

            if (EmpresaAtualId == 0)
            {
                throw new InvalidOperationException("Sem ninguém logado não dá para gravar dados de uma empresa.");
            }

            var empresa = entrada.Property(ColunaEmpresa);
            empresa.CurrentValue = EmpresaAtualId;
            if (entrada.State != EntityState.Added)
            {
                empresa.OriginalValue = EmpresaAtualId;
                empresa.IsModified = false;
            }
        }
    }
}
