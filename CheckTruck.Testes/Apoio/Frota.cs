using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Servicos;
using Microsoft.Extensions.Logging.Abstractions;

namespace CheckTruck.Testes.Apoio;

/// <summary>
/// Monta uma frota de teste no banco de mentira: um Volvo FH (geração e norma escolhidas no teste)
/// e três itens: óleo do motor, óleo do diferencial e embreagem (que não tem padrão do sistema).
/// </summary>
public sealed class Frota
{
    public RepositorioEmMemoria Repositorio { get; } = new();
    public Geracao Geracao { get; }
    public Potencia Potencia { get; }
    public TipoManutencao Oleo { get; }
    public TipoManutencao Diferencial { get; }
    public TipoManutencao Embreagem { get; }
    public Usuario UsuarioLogado { get; } = new() { Id = "usuario-1", Nome = "Gestor de Teste", Cargo = Cargo.Gestor, Ativo = true };

    public Frota(NormaEmissao norma = NormaEmissao.Euro6)
    {
        var pais = new Pais { Id = 1, Nome = "Suécia" };
        var fabricante = new Fabricante { Id = 1, Nome = "Volvo", PaisOrigem = pais };
        var modelo = new Modelo { Id = 1, Nome = "FH", Fabricante = fabricante };
        Geracao = new Geracao { Id = 1, Nome = "FH Aero", Modelo = modelo, AnoInicio = 2023, NormaEmissao = norma };
        Potencia = new Potencia { Id = 1, Cv = 540, Geracao = Geracao };

        Oleo = Tipo(1, "Óleo do motor", Componente.Motor);
        Diferencial = Tipo(2, "Óleo do diferencial", Componente.Diferencial1);
        Embreagem = Tipo(3, "Embreagem", Componente.Embreagem);
    }

    /// <summary>Caminhão que entrou no sistema com <paramref name="kmDeEntrada"/> e está hoje com <paramref name="kmAtual"/>.</summary>
    public Veiculo Caminhao(int kmDeEntrada, int? kmAtual = null, long id = 1)
    {
        var veiculo = new Veiculo
        {
            Id = id,
            Placa = $"ABC-1D2{id}",
            Chassi = $"9BVTESTE000000{id:000}",
            Potencia = Potencia,
            Tracao = Tracao.SeisPorQuatro,
            KmAtual = kmAtual ?? kmDeEntrada,
            Ativo = true,
            AnoFabricacao = new DateTime(2023, 1, 1),
            AnoModelo = new DateTime(2024, 1, 1),
        };
        Repositorio.Tabela<Veiculo>().Add(veiculo);

        RegistrarKm(veiculo, null, kmDeEntrada, OrigemKm.Cadastro);
        if (kmAtual is { } km && km != kmDeEntrada)
        {
            RegistrarKm(veiculo, kmDeEntrada, km, OrigemKm.AtualizarKm);
        }

        return veiculo;
    }

    /// <summary>OS já lançada, com um item trocado (a próxima troca já gravada nele).</summary>
    public OrdemServico OsLancada(Veiculo veiculo, DateTime realizadoEm, int km, TipoManutencao tipo, int kmProximaTroca,
        DateTime? dataProximaTroca = null)
    {
        var os = new OrdemServico
        {
            Id = Repositorio.Tabela<OrdemServico>().Count + 1,
            Veiculo = veiculo,
            RealizadoEm = realizadoEm,
            KmAtual = km,
        };
        var item = new ItemOrdemServico
        {
            OrdemServico = os,
            TipoManutencao = tipo,
            KmProximaTroca = kmProximaTroca,
            DataProximaTroca = dataProximaTroca,
        };
        os.Itens.Add(item);
        Repositorio.Tabela<OrdemServico>().Add(os);
        Repositorio.Tabela<ItemOrdemServico>().Add(item);
        return os;
    }

    /// <summary>Intervalo de fábrica da geração (do catálogo do sistema, sem empresa).</summary>
    public void IntervaloDeFabrica(TipoManutencao tipo, int km, int meses = 0, int kmPrimeira = 0) =>
        Repositorio.Tabela<IntervaloRecomendado>().Add(new IntervaloRecomendado
        {
            Geracao = Geracao, TipoManutencao = tipo, IntervaloKm = km, IntervaloMeses = meses, IntervaloKmPrimeira = kmPrimeira,
        });

    /// <summary>Intervalo que a empresa cadastrou para a geração.</summary>
    public void IntervaloDaEmpresa(TipoManutencao tipo, int km, int meses = 0) =>
        Repositorio.Tabela<IntervaloRecomendado>().Add(new IntervaloRecomendado
        {
            EmpresaId = 1, Geracao = Geracao, TipoManutencao = tipo, IntervaloKm = km, IntervaloMeses = meses,
        });

    /// <summary>Intervalo próprio do caminhão (ex.: plano da concessionária).</summary>
    public void IntervaloDoCaminhao(Veiculo veiculo, TipoManutencao tipo, int km, int meses = 0) =>
        Repositorio.Tabela<IntervaloVeiculo>().Add(new IntervaloVeiculo
        {
            Veiculo = veiculo, TipoManutencao = tipo, IntervaloKm = km, IntervaloMeses = meses,
        });

    public ServicoSituacaoVeiculo CriarServicoSituacao() => new(Repositorio, NullLogger<ServicoSituacaoVeiculo>.Instance);

    public ServicoOrdemServico CriarServicoOrdemServico() =>
        new(Repositorio, CriarServicoSituacao(), new Logado(UsuarioLogado), NullLogger<ServicoOrdemServico>.Instance);

    public ServicoChamado CriarServicoChamado() =>
        new(Repositorio,
            new ServicoCrud<Veiculo>(Repositorio, NullLogger<ServicoCrud<Veiculo>>.Instance),
            NullLogger<ServicoChamado>.Instance);

    public ServicoVeiculo CriarServicoVeiculo() =>
        new(Repositorio,
            new ServicoCrud<OrdemServico>(Repositorio, NullLogger<ServicoCrud<OrdemServico>>.Instance),
            new Logado(UsuarioLogado),
            NullLogger<ServicoVeiculo>.Instance);

    private TipoManutencao Tipo(long id, string nome, Componente componente)
    {
        var tipo = new TipoManutencao { Id = id, Nome = nome, Componente = componente };
        Repositorio.Tabela<TipoManutencao>().Add(tipo);
        return tipo;
    }

    private void RegistrarKm(Veiculo veiculo, int? kmAnterior, int kmNovo, OrigemKm origem) =>
        Repositorio.Tabela<RegistroKm>().Add(new RegistroKm
        {
            Veiculo = veiculo, KmAnterior = kmAnterior, KmNovo = kmNovo, Origem = origem, RegistradoEm = DateTime.UtcNow,
        });

    private sealed class Logado(Usuario usuario) : IUsuarioLogado
    {
        public Usuario? Usuario { get; } = usuario;
    }
}
