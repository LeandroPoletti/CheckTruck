using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Servicos;
using CheckTruck.Repositorio;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace CheckTruck.Testes.Apoio;

/// <summary>
/// Banco de verdade para os testes da separação entre empresas: SQLite na memória com o Context da API (filtro
/// por empresa, empresa no WHERE, índices únicos e chaves estrangeiras). Cada Context abre como se uma pessoa
/// estivesse logada, para ver o que a empresa dela enxerga e consegue mudar. O banco some no fim do teste.
/// </summary>
public sealed class BancoDeTeste : IDisposable
{
    private readonly SqliteConnection _conexao = new("DataSource=:memory:");
    private readonly DbContextOptions<Context> _opcoes;

    public BancoDeTeste()
    {
        _conexao.Open();
        _opcoes = new DbContextOptionsBuilder<Context>().UseSqlite(_conexao).Options;
        using var context = Abrir(null);
        context.Database.EnsureCreated();
    }

    /// <summary>Context como se <paramref name="quem"/> estivesse logado (null: ninguém, como nos seeds).</summary>
    public Context Abrir(Usuario? quem) => new(_opcoes, new Logado(quem));

    /// <summary>Os acessos (ServicoUsuario) de quem está logado, gravando no mesmo Context.</summary>
    public static ServicoUsuario Acessos(Context context, Usuario quem) => new(
        new UserManager<Usuario>(new UserOnlyStore<Usuario>(context), null!, null!, null!, null!, null!, null!, null!,
            NullLogger<UserManager<Usuario>>.Instance),
        new Logado(quem));

    public void Dispose() => _conexao.Dispose();

    private sealed class Logado(Usuario? usuario) : IUsuarioLogado
    {
        public Usuario? Usuario { get; } = usuario;
    }
}
