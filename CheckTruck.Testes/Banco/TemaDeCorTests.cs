using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Testes.Apoio;

namespace CheckTruck.Testes.Banco;

/// <summary>
/// A cor do site e do app fica na conta de cada pessoa: quem troca só muda a própria (no banco de verdade, para
/// conferir que fica gravada). Quem nunca escolheu fica com o Verde.
/// </summary>
public sealed class TemaDeCorTests : IDisposable
{
    private readonly BancoDeTeste _banco = new();
    private readonly Usuario _admin;
    private readonly Usuario _dono;

    public TemaDeCorTests()
    {
        using var context = _banco.Abrir(null);
        var empresa = new Empresa { Nome = "Transportes A", Documento = "11222333000181" };
        context.Empresas.Add(empresa);
        context.SaveChanges();

        _admin = Pessoa("admin", empresa.Id, Cargo.Admin);
        _dono = Pessoa("dono", null, Cargo.DonoDoSistema);
        context.Users.AddRange(_admin, _dono, Pessoa("motorista", empresa.Id, Cargo.Motorista));
        context.SaveChanges();
    }

    public void Dispose() => _banco.Dispose();

    private static Usuario Pessoa(string id, long? empresaId, Cargo cargo) => new()
    {
        Id = id, Nome = id, Email = $"{id}@teste.com", UserName = $"{id}@teste.com", EmpresaId = empresaId, Cargo = cargo, Ativo = true,
    };

    private TemaDeCor TemaGravado(string id)
    {
        using var leitura = _banco.Abrir(null);
        return leitura.Users.Single(u => u.Id == id).Tema;
    }

    [Fact]
    public async Task Troca_so_a_propria_cor_e_ela_fica_gravada()
    {
        using (var context = _banco.Abrir(_admin))
        {
            Assert.True(await BancoDeTeste.Acessos(context, _admin).AlterarTemaAsync(TemaDeCor.Amarelo));
        }

        Assert.Equal(TemaDeCor.Amarelo, TemaGravado("admin"));
        Assert.Equal(TemaDeCor.Verde, TemaGravado("motorista"));
    }

    [Fact]
    public async Task O_dono_do_sistema_tambem_troca_a_cor_dele()
    {
        using (var context = _banco.Abrir(_dono))
        {
            Assert.True(await BancoDeTeste.Acessos(context, _dono).AlterarTemaAsync(TemaDeCor.Preto));
        }

        Assert.Equal(TemaDeCor.Preto, TemaGravado("dono"));
    }

    [Fact]
    public async Task Cor_que_nao_existe_nao_grava()
    {
        using (var context = _banco.Abrir(_admin))
        {
            var acessos = BancoDeTeste.Acessos(context, _admin);

            Assert.False(await acessos.AlterarTemaAsync((TemaDeCor)9));
            Assert.Equal(new[] { "Escolha uma cor válida." }, acessos.Mensagens);
        }

        Assert.Equal(TemaDeCor.Verde, TemaGravado("admin"));
    }
}
