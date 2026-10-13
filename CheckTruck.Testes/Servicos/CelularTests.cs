using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Servicos;
using CheckTruck.Testes.Apoio;
using Microsoft.Extensions.Logging.Abstractions;

namespace CheckTruck.Testes.Servicos;

/// <summary>
/// Aviso de chamado novo no celular: o app grava o celular de quem entrou e apaga ao sair. Ao abrir um chamado,
/// quem pode atender chamados na mesma empresa recebe o aviso, menos quem abriu. Falha no aviso não atrapalha.
/// </summary>
public class CelularTests
{
    private readonly Frota _frota = new();
    private readonly AvisosDeMentira _avisos = new();
    private readonly ServicoCelular _servico;
    private readonly Usuario _chefe = Pessoa("chefe", Cargo.ChefeManutencao, Permissao.AbrirChamados | Permissao.AtenderChamados);
    private readonly Usuario _mecanico = Pessoa("mecanico", Cargo.Mecanico, Permissao.AtenderChamados);
    private readonly Usuario _gestor = Pessoa("gestor", Cargo.Gestor);

    public CelularTests()
    {
        _servico = new ServicoCelular(
            new ServicoCrud<Celular>(_frota.Repositorio, NullLogger<ServicoCrud<Celular>>.Instance),
            _avisos,
            NullLogger<ServicoCelular>.Instance);
    }

    private List<Celular> Celulares => _frota.Repositorio.Tabela<Celular>();

    private static Usuario Pessoa(string id, Cargo cargo, Permissao permissoes = Permissao.Nenhuma, long empresa = 1,
        bool ativo = true) =>
        new() { Id = id, Nome = id, Cargo = cargo, Permissoes = permissoes, EmpresaId = empresa, Ativo = ativo };

    private static string Token(string nome) => $"ExponentPushToken[{nome}]";

    // Celular já gravado (o token leva o nome do dono)
    private void CelularDe(Usuario dono) =>
        Celulares.Add(new Celular { Id = Celulares.Count + 1, Token = Token(dono.Id), Usuario = dono });

    private Chamado ChamadoAbertoPor(Usuario quem) => new()
    {
        Id = 7,
        Veiculo = _frota.Caminhao(kmDeEntrada: 100_000),
        Tipo = TipoOcorrencia.Vazamento,
        Urgencia = UrgenciaChamado.Alta,
        Descricao = "Pingando óleo embaixo do motor",
        AbertoPor = quem,
    };

    [Fact]
    public void Grava_o_celular_de_quem_entrou()
    {
        Assert.True(_servico.Registrar(_mecanico, $" {Token("a")} "));

        var celular = Assert.Single(Celulares);
        Assert.Equal(Token("a"), celular.Token);
        Assert.Same(_mecanico, celular.Usuario);
    }

    [Fact]
    public void Celular_que_ja_estava_gravado_passa_para_quem_entrou_agora()
    {
        CelularDe(_chefe);

        Assert.True(_servico.Registrar(_mecanico, Token("chefe")));

        Assert.Same(_mecanico, Assert.Single(Celulares).Usuario);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("qualquer-coisa")]
    [InlineData("ExponentPushToken[sem-fechar")]
    public void Recusa_o_que_nao_e_token_do_Expo(string? token)
    {
        Assert.False(_servico.Registrar(_mecanico, token));

        Assert.Contains("Não deu para ligar os avisos neste celular.", _servico.Mensagens);
        Assert.Empty(Celulares);
    }

    [Fact]
    public void Ao_sair_apaga_so_o_celular_de_quem_saiu()
    {
        CelularDe(_chefe);
        CelularDe(_mecanico);

        _servico.Esquecer(_mecanico, Token("chefe"));
        Assert.Equal(2, Celulares.Count);

        _servico.Esquecer(_mecanico, Token("mecanico"));
        Assert.Equal(Token("chefe"), Assert.Single(Celulares).Token);
    }

    [Fact]
    public async Task Chamado_novo_avisa_quem_pode_atender_na_mesma_empresa_menos_quem_abriu()
    {
        CelularDe(_chefe);
        CelularDe(_mecanico);
        CelularDe(_gestor);
        CelularDe(Pessoa("almoxarife", Cargo.Almoxarife, Permissao.VerFrota));
        CelularDe(Pessoa("inativo", Cargo.Mecanico, Permissao.AtenderChamados, ativo: false));
        CelularDe(Pessoa("de-outra-empresa", Cargo.Mecanico, Permissao.AtenderChamados, empresa: 2));

        await _servico.AvisarChamadoNovoAsync(ChamadoAbertoPor(_chefe));

        var (tokens, aviso) = Assert.Single(_avisos.Enviados);
        Assert.Equal(new[] { Token("mecanico"), Token("gestor") }, tokens);
        Assert.Equal(new AvisoNoCelular("Chamado novo: ABC-1D21", "Vazamento · urgente", 7), aviso);
    }

    [Fact]
    public async Task Sem_ninguem_para_avisar_nao_manda_nada()
    {
        CelularDe(_chefe);

        await _servico.AvisarChamadoNovoAsync(ChamadoAbertoPor(_chefe));

        Assert.Empty(_avisos.Enviados);
    }

    [Fact]
    public async Task Apaga_o_celular_que_nao_vale_mais()
    {
        CelularDe(_mecanico);
        CelularDe(_gestor);
        _avisos.NaoValem.Add(Token("gestor"));

        await _servico.AvisarChamadoNovoAsync(ChamadoAbertoPor(_chefe));

        Assert.Equal(Token("mecanico"), Assert.Single(Celulares).Token);
    }

    [Fact]
    public async Task Falha_no_aviso_nao_atrapalha_o_chamado()
    {
        CelularDe(_mecanico);
        _avisos.Falhar = true;

        await _servico.AvisarChamadoNovoAsync(ChamadoAbertoPor(_chefe));

        Assert.Single(Celulares);
    }

    // Serviço de avisos de mentira: guarda o que mandaria, sem internet
    private sealed class AvisosDeMentira : IEnviadorDeAvisos
    {
        public List<(IReadOnlyList<string> Tokens, AvisoNoCelular Aviso)> Enviados { get; } = new();
        public List<string> NaoValem { get; } = new();
        public bool Falhar { get; set; }

        public Task<IReadOnlyList<string>> EnviarAsync(IReadOnlyList<string> tokens, AvisoNoCelular aviso)
        {
            if (Falhar)
            {
                throw new HttpRequestException("Sem internet.");
            }

            Enviados.Add((tokens, aviso));
            return Task.FromResult<IReadOnlyList<string>>(NaoValem);
        }
    }
}
