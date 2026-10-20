using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Servicos;
using CheckTruck.Testes.Apoio;
using Microsoft.Extensions.Logging.Abstractions;

namespace CheckTruck.Testes.Servicos;

/// <summary>
/// Empresas, que só o dono do sistema cadastra (a API confere): os dados da empresa e o CPF do Admin são
/// conferidos antes de criar o login, e a empresa desativada guarda quando foi desativada.
/// </summary>
public class EmpresaTests
{
    private const string CnpjValido = "11.222.333/0001-81";
    private const string CpfValido = "529.982.247-25";

    private readonly RepositorioEmMemoria _repositorio = new();
    private readonly ServicoEmpresa _servico;

    public EmpresaTests()
    {
        var dono = new Logado(new Usuario { Id = "dono", Nome = "Dono do sistema", Cargo = Cargo.DonoDoSistema, Ativo = true });
        // O UserManager só é usado para gravar o Admin, e nesses testes os dados param antes
        _servico = new ServicoEmpresa(_repositorio, new ServicoUsuario(null!, dono), dono, NullLogger<ServicoEmpresa>.Instance);
    }

    private List<Empresa> Empresas => _repositorio.Tabela<Empresa>();

    private Empresa EmpresaGravada()
    {
        var empresa = new Empresa { Id = 1, Nome = "Transportes Teste", Documento = "11222333000181" };
        Empresas.Add(empresa);
        return empresa;
    }

    private Task<Usuario?> Cadastrar(string nomeEmpresa = "Transportes Novo", string cnpj = CnpjValido, string cpf = CpfValido) =>
        _servico.CriarAsync(nomeEmpresa, cnpj, "Dona da empresa", cpf, "dona@empresa.com", "Senha@123");

    [Fact]
    public async Task Nao_cadastra_sem_o_nome_da_empresa()
    {
        Assert.Null(await Cadastrar(nomeEmpresa: "   "));

        Assert.Contains("Informe o nome da empresa.", _servico.Mensagens);
        Assert.Empty(Empresas);
    }

    [Theory]
    [InlineData("11.222.333/0001-80")]
    [InlineData("")]
    public async Task Nao_cadastra_com_cnpj_invalido(string cnpj)
    {
        Assert.Null(await Cadastrar(cnpj: cnpj));

        Assert.Contains("CNPJ inválido.", _servico.Mensagens);
    }

    [Fact]
    public async Task Nao_cadastra_cnpj_que_ja_tem_empresa_com_ou_sem_mascara()
    {
        EmpresaGravada();

        Assert.Null(await Cadastrar(cnpj: CnpjValido));

        Assert.Contains("Já existe uma empresa com esse CNPJ.", _servico.Mensagens);
        Assert.Single(Empresas);
    }

    [Fact]
    public async Task Nao_cadastra_com_cpf_invalido_do_admin()
    {
        Assert.Null(await Cadastrar(cpf: "529.982.247-24"));

        Assert.Equal(new[] { "CPF inválido." }, _servico.Mensagens);
    }

    [Fact]
    public void Desativar_guarda_quando_e_ativar_de_novo_limpa()
    {
        var empresa = EmpresaGravada();

        Assert.Same(empresa, _servico.AlterarAtiva(1, ativa: false));
        Assert.False(empresa.Ativa);
        Assert.NotNull(empresa.DesativadaEm);

        Assert.Same(empresa, _servico.AlterarAtiva(1, ativa: true));
        Assert.True(empresa.Ativa);
        Assert.Null(empresa.DesativadaEm);
    }

    [Fact]
    public void Desativar_de_novo_mantem_a_data_da_primeira_vez()
    {
        var primeiraVez = new DateTime(2026, 1, 10, 8, 0, 0, DateTimeKind.Utc);
        var empresa = EmpresaGravada();
        empresa.DesativadaEm = primeiraVez;

        _servico.AlterarAtiva(1, ativa: false);

        Assert.Equal(primeiraVez, empresa.DesativadaEm);
    }

    [Fact]
    public void Empresa_que_nao_existe_avisa()
    {
        Assert.Null(_servico.AlterarAtiva(99, ativa: false));

        Assert.Equal(new[] { "Empresa não encontrada." }, _servico.Mensagens);
    }

    private sealed class Logado(Usuario usuario) : IUsuarioLogado
    {
        public Usuario? Usuario { get; } = usuario;
    }
}
