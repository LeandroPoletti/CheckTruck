using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Repositorio;
using CheckTruck.Testes.Apoio;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Testes.Banco;

/// <summary>
/// Os dados de uma empresa nunca aparecem nem mudam para outra. Roda no banco de verdade (SQLite na memória) com
/// o Context da API: duas empresas, A e B, cada uma com o Admin e um motorista, e o catálogo do sistema (Volvo FH).
/// A empresa nunca vem do site ou do app: é sempre a de quem está logado.
/// </summary>
public sealed class SeparacaoEntreEmpresasTests : IDisposable
{
    private const string ChassiA = "9BVR4X20DJE882301";
    private const string ChassiB = "9BSR6X40ZJ3912345";

    private readonly BancoDeTeste _banco = new();
    private readonly Empresa _empresaA = new() { Nome = "Transportes A", Documento = "11222333000181" };
    private readonly Empresa _empresaB = new() { Nome = "Transportes B", Documento = "45997418000153" };
    private readonly Usuario _adminA;
    private readonly Usuario _adminB;
    private readonly Usuario _dono;
    private readonly long _potenciaId;

    public SeparacaoEntreEmpresasTests()
    {
        // Sem ninguém logado, como nos seeds: o catálogo fica do sistema
        using var context = _banco.Abrir(null);
        context.Empresas.AddRange(_empresaA, _empresaB);
        var potencia = new Potencia
        {
            Cv = 540,
            Geracao = new Geracao
            {
                Nome = "FH Aero", AnoInicio = 2023, NormaEmissao = NormaEmissao.Euro6,
                Modelo = new Modelo { Nome = "FH", Fabricante = new Fabricante { Nome = "Volvo", PaisOrigem = new Pais { Nome = "Suécia" } } },
            },
        };
        context.Potencias.Add(potencia);
        context.SaveChanges();
        _potenciaId = potencia.Id;

        _adminA = Pessoa("admin-a", _empresaA.Id, Cargo.Admin);
        _adminB = Pessoa("admin-b", _empresaB.Id, Cargo.Admin);
        _dono = Pessoa("dono", null, Cargo.DonoDoSistema);
        context.Users.AddRange(_adminA, _adminB, _dono,
            Pessoa("motorista-a", _empresaA.Id, Cargo.Motorista), Pessoa("motorista-b", _empresaB.Id, Cargo.Motorista));
        context.SaveChanges();
    }

    public void Dispose() => _banco.Dispose();

    private static Usuario Pessoa(string id, long? empresaId, Cargo cargo) => new()
    {
        Id = id, Nome = id, Email = $"{id}@teste.com", UserName = $"{id}@teste.com", EmpresaId = empresaId, Cargo = cargo, Ativo = true,
    };

    // Como a API monta o caminhão: a potência é buscada no banco, o resto vem do pedido
    private Veiculo NovoCaminhao(Context context, string placa, string chassi) => new()
    {
        Placa = placa,
        Chassi = chassi,
        Tracao = Tracao.SeisPorDois,
        KmAtual = 100_000,
        Ativo = true,
        AnoFabricacao = new DateTime(2023, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        AnoModelo = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        Potencia = context.Potencias.Single(p => p.Id == _potenciaId),
    };

    private long CadastrarCaminhao(Usuario quem, string placa = "ABC-1D23", string chassi = ChassiA)
    {
        using var context = _banco.Abrir(quem);
        var veiculo = NovoCaminhao(context, placa, chassi);
        context.Veiculos.Add(veiculo);
        context.SaveChanges();
        return veiculo.Id;
    }

    private long CadastrarFabricante(Usuario quem, string nome)
    {
        using var context = _banco.Abrir(quem);
        var fabricante = new Fabricante { Nome = nome, PaisOrigem = context.Paises.Single() };
        context.Fabricantes.Add(fabricante);
        context.SaveChanges();
        return fabricante.Id;
    }

    private List<string> Placas(Usuario quem)
    {
        using var context = _banco.Abrir(quem);
        return context.Veiculos.OrderBy(v => v.Placa).Select(v => v.Placa).ToList();
    }

    private List<string> Fabricantes(Usuario quem)
    {
        using var context = _banco.Abrir(quem);
        return context.Fabricantes.OrderBy(f => f.Nome).Select(f => f.Nome).ToList();
    }

    [Fact]
    public void Cada_empresa_so_ve_os_proprios_caminhoes()
    {
        CadastrarCaminhao(_adminA, "AAA-1A11", ChassiA);
        CadastrarCaminhao(_adminB, "BBB-2B22", ChassiB);

        Assert.Equal(new[] { "AAA-1A11" }, Placas(_adminA));
        Assert.Equal(new[] { "BBB-2B22" }, Placas(_adminB));
    }

    [Fact]
    public void Pelo_id_nao_acha_o_caminhao_de_outra_empresa()
    {
        var idDaA = CadastrarCaminhao(_adminA);

        using var context = _banco.Abrir(_adminB);
        var repositorio = new RepositorioCrud(context);
        Assert.Null(repositorio.GetById<Veiculo>(idDaA));
        Assert.False(repositorio.Query<Veiculo>(v => v.Id == idDaA).Any());
    }

    [Fact]
    public void Nao_altera_o_caminhao_de_outra_empresa_mesmo_mandando_o_id()
    {
        var idDaA = CadastrarCaminhao(_adminA, "AAA-1A11");

        using (var context = _banco.Abrir(_adminB))
        {
            var falso = NovoCaminhao(context, "ZZZ-9Z99", ChassiB);
            falso.Id = idDaA;
            // A empresa vai no WHERE do UPDATE: o banco não acha a linha e nada muda
            Assert.Throws<DbUpdateConcurrencyException>(() => new RepositorioCrud(context).Update(falso));
        }

        Assert.Equal(new[] { "AAA-1A11" }, Placas(_adminA));
    }

    [Fact]
    public void Nao_exclui_o_caminhao_de_outra_empresa()
    {
        var idDaA = CadastrarCaminhao(_adminA);

        using (var context = _banco.Abrir(_adminB))
        {
            Assert.Null(new RepositorioCrud(context).Delete<Veiculo>(idDaA));

            // Forçando a exclusão pelo id: a empresa vai no WHERE do DELETE e o banco não acha a linha
            context.Veiculos.Remove(new Veiculo { Id = idDaA });
            Assert.Throws<DbUpdateConcurrencyException>(() => context.SaveChanges());
        }

        Assert.Single(Placas(_adminA));
    }

    [Fact]
    public void Registro_novo_fica_com_a_empresa_de_quem_esta_logado()
    {
        long id;
        using (var context = _banco.Abrir(_adminA))
        {
            var mecanico = new Mecanico { Nome = "Marco Rueda", Funcao = "Mecânico" };
            context.Mecanicos.Add(mecanico);
            // Mesmo que alguém tente pôr outra empresa, vale a de quem está logado
            context.Entry(mecanico).Property(Context.ColunaEmpresa).CurrentValue = _empresaB.Id;
            context.SaveChanges();
            id = mecanico.Id;
        }

        using var leitura = _banco.Abrir(null);
        var empresa = leitura.Mecanicos.IgnoreQueryFilters()
            .Where(m => m.Id == id)
            .Select(m => EF.Property<long>(m, Context.ColunaEmpresa))
            .Single();
        Assert.Equal(_empresaA.Id, empresa);
    }

    [Fact]
    public void Dono_do_sistema_nao_ve_nem_grava_dados_de_empresa()
    {
        CadastrarCaminhao(_adminA);

        using var context = _banco.Abrir(_dono);
        Assert.Empty(context.Veiculos.ToList());

        context.Mecanicos.Add(new Mecanico { Nome = "Marco Rueda", Funcao = "Mecânico" });
        Assert.Throws<InvalidOperationException>(() => context.SaveChanges());
    }

    [Fact]
    public void Catalogo_mostra_o_do_sistema_e_o_da_propria_empresa()
    {
        CadastrarFabricante(_adminA, "Marca da A");
        CadastrarFabricante(_adminB, "Marca da B");

        Assert.Equal(new[] { "Marca da A", "Volvo" }, Fabricantes(_adminA));
        Assert.Equal(new[] { "Marca da B", "Volvo" }, Fabricantes(_adminB));
        Assert.Equal(new[] { "Volvo" }, Fabricantes(_dono));
    }

    [Fact]
    public void Empresa_nao_ve_nem_exclui_o_item_do_catalogo_de_outra()
    {
        var idDaA = CadastrarFabricante(_adminA, "Marca da A");

        using (var context = _banco.Abrir(_adminB))
        {
            var repositorio = new RepositorioCrud(context);
            Assert.Null(repositorio.GetById<Fabricante>(idDaA));
            Assert.Null(repositorio.Delete<Fabricante>(idDaA));
        }

        Assert.Contains("Marca da A", Fabricantes(_adminA));
    }

    [Fact]
    public void Empresa_nao_muda_o_item_do_catalogo_do_sistema()
    {
        using (var context = _banco.Abrir(_adminA))
        {
            var volvo = context.Fabricantes.Single(f => f.Nome == "Volvo");
            volvo.Nome = "Volvo da A";
            // O item do sistema não tem empresa, e o UPDATE leva a empresa de quem está logado no WHERE
            Assert.Throws<DbUpdateConcurrencyException>(() => context.SaveChanges());
        }

        Assert.Equal(new[] { "Volvo" }, Fabricantes(_adminB));
    }

    [Fact]
    public void A_mesma_placa_pode_estar_em_empresas_diferentes_mas_nao_repete_na_mesma()
    {
        CadastrarCaminhao(_adminA, "ABC-1D23", ChassiA);
        CadastrarCaminhao(_adminB, "ABC-1D23", ChassiA);

        Assert.ThrowsAny<DbUpdateException>(() => CadastrarCaminhao(_adminA, "ABC-1D23", ChassiB));
    }

    [Fact]
    public void Toda_tabela_de_empresa_e_do_catalogo_e_separada_no_Context()
    {
        using var context = _banco.Abrir(null);
        var separadas = typeof(EntidadeDaEmpresa).Assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false }
                && (typeof(EntidadeDaEmpresa).IsAssignableFrom(t) || typeof(ItemDoCatalogo).IsAssignableFrom(t)))
            .ToList();

        Assert.NotEmpty(separadas);
        foreach (var tipo in separadas)
        {
            // A coluna da empresa vai no WHERE: o DaEmpresa e o DoCatalogo do Context põem ela e o filtro juntos
            var coluna = context.Model.FindEntityType(tipo)?.FindProperty(Context.ColunaEmpresa);
            Assert.True(coluna is { IsConcurrencyToken: true }, $"{tipo.Name} não está separado por empresa no Context.");
        }
    }

    [Fact]
    public async Task Acessos_so_da_propria_empresa()
    {
        using var context = _banco.Abrir(_adminA);
        var acessos = BancoDeTeste.Acessos(context, _adminA);

        Assert.Equal(new[] { "admin-a", "motorista-a" }, acessos.Listar().Select(u => u.Id).ToList());
        Assert.Equal(new[] { "motorista-a" }, acessos.ListarMotoristasAtivos().Select(u => u.Id).ToList());
        Assert.Null(await acessos.ObterAsync("motorista-b"));
    }

    [Fact]
    public async Task Nao_edita_nem_desativa_acesso_de_outra_empresa()
    {
        using (var context = _banco.Abrir(_adminA))
        {
            var acessos = BancoDeTeste.Acessos(context, _adminA);
            var dados = new Usuario { Nome = "Trocado", Email = "trocado@teste.com", Cargo = Cargo.Motorista };

            Assert.Null(await acessos.AlterarAtivoAsync("motorista-b", false, _adminA.Id));
            Assert.Null(await acessos.AtualizarAsync("motorista-b", dados, null, _adminA.Id));
            Assert.Equal(new[] { "Acesso não encontrado.", "Acesso não encontrado." }, acessos.Mensagens);
        }

        using var leitura = _banco.Abrir(null);
        var motoristaB = leitura.Users.Single(u => u.Id == "motorista-b");
        Assert.True(motoristaB.Ativo);
        Assert.Equal("motorista-b", motoristaB.Nome);
    }
}
