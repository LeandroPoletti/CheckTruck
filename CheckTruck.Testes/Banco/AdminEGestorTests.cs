using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Testes.Apoio;

namespace CheckTruck.Testes.Banco;

/// <summary>
/// Admin e Gestor cuidam dos acessos, mas o acesso de um Admin, e o cargo de Admin, só um Admin muda. Roda no banco
/// de verdade (SQLite na memória) com uma empresa: dois Admins, um Gestor e um motorista.
/// </summary>
public sealed class AdminEGestorTests : IDisposable
{
    private const string SoAdminMexeEmAdmin = "Só um Admin pode mudar ou desativar o acesso de um Admin.";
    private const string SoAdminDaCargoDeAdmin = "Só um Admin pode dar o cargo de Admin.";

    private readonly BancoDeTeste _banco = new();
    private readonly Usuario _admin;
    private readonly Usuario _outroAdmin;
    private readonly Usuario _gestor;
    private readonly Usuario _motorista;

    public AdminEGestorTests()
    {
        using var context = _banco.Abrir(null);
        var empresa = new Empresa { Nome = "Transportes A", Documento = "11222333000181" };
        context.Empresas.Add(empresa);
        context.SaveChanges();

        _admin = Pessoa("admin", empresa.Id, Cargo.Admin);
        _outroAdmin = Pessoa("outro-admin", empresa.Id, Cargo.Admin);
        _gestor = Pessoa("gestor", empresa.Id, Cargo.Gestor);
        _motorista = Pessoa("motorista", empresa.Id, Cargo.Motorista);
        context.Users.AddRange(_admin, _outroAdmin, _gestor, _motorista);
        context.SaveChanges();
    }

    public void Dispose() => _banco.Dispose();

    private static Usuario Pessoa(string id, long empresaId, Cargo cargo) => new()
    {
        Id = id, Nome = id, Email = $"{id}@teste.com", UserName = $"{id}@teste.com", EmpresaId = empresaId, Cargo = cargo, Ativo = true,
    };

    private static Usuario Dados(Cargo cargo) => new() { Nome = "Trocado", Email = "trocado@teste.com", Cpf = "52998224725", Cargo = cargo };

    private bool Ativo(string id)
    {
        using var context = _banco.Abrir(null);
        return context.Users.Single(u => u.Id == id).Ativo;
    }

    [Fact]
    public async Task Gestor_nao_muda_nem_desativa_o_Admin()
    {
        using (var context = _banco.Abrir(_gestor))
        {
            var acessos = BancoDeTeste.Acessos(context, _gestor);

            Assert.Null(await acessos.AtualizarAsync(_admin.Id, Dados(Cargo.Motorista), "Nova@123", _gestor.Id));
            Assert.Null(await acessos.AlterarAtivoAsync(_admin.Id, false, _gestor.Id));
            Assert.Equal(new[] { SoAdminMexeEmAdmin, SoAdminMexeEmAdmin }, acessos.Mensagens);
        }

        Assert.True(Ativo(_admin.Id));
    }

    [Fact]
    public async Task Gestor_nao_cadastra_nem_promove_ninguem_a_Admin()
    {
        using var context = _banco.Abrir(_gestor);
        var acessos = BancoDeTeste.Acessos(context, _gestor);

        var novo = new Usuario { Nome = "Novo", Email = "novo@teste.com", Cpf = "11144477735", Cargo = Cargo.Admin };
        Assert.Null(await acessos.CriarAsync(novo, "Senha@123"));
        Assert.Null(await acessos.AtualizarAsync(_motorista.Id, Dados(Cargo.Admin), null, _gestor.Id));
        Assert.Equal(new[] { SoAdminDaCargoDeAdmin, SoAdminDaCargoDeAdmin }, acessos.Mensagens);
    }

    [Fact]
    public async Task Admin_desativa_outro_Admin()
    {
        using (var context = _banco.Abrir(_admin))
        {
            var acessos = BancoDeTeste.Acessos(context, _admin);

            Assert.NotNull(await acessos.AlterarAtivoAsync(_outroAdmin.Id, false, _admin.Id));
        }

        Assert.False(Ativo(_outroAdmin.Id));
    }
}
