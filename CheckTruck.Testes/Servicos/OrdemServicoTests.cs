using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Testes.Apoio;

namespace CheckTruck.Testes.Servicos;

/// <summary>Lançar OS (ServicoOrdemServico): próxima troca de cada item, km do caminhão e o que barra o lançamento.</summary>
public class OrdemServicoTests
{
    private static readonly DateTime Hoje = DateTime.UtcNow.Date;

    private readonly Frota _frota = new();
    private readonly Veiculo _caminhao;
    private readonly Mecanico _mecanico = new() { Id = 1, Nome = "João", Funcao = "Mecânico", Ativo = true };

    public OrdemServicoTests() => _caminhao = _frota.Caminhao(kmDeEntrada: 90_000, kmAtual: 100_000);

    private OrdemServico NovaOs(int km, params ItemOrdemServico[] itens)
    {
        var os = new OrdemServico { Veiculo = _caminhao, RealizadoEm = Hoje, KmAtual = km };
        foreach (var item in itens) os.Itens.Add(item);
        os.Mecanicos.Add(_mecanico);
        return os;
    }

    private static ItemOrdemServico Item(TipoManutencao tipo, int kmProximaTroca = 0, DateTime? dataProximaTroca = null) =>
        new() { TipoManutencao = tipo, KmProximaTroca = kmProximaTroca, DataProximaTroca = dataProximaTroca };

    [Fact]
    public void Sem_km_e_data_a_proxima_troca_vem_do_intervalo()
    {
        var servico = _frota.CriarServicoOrdemServico();
        var item = Item(_frota.Oleo);

        var lancada = servico.Inserir(NovaOs(102_000, item));

        Assert.NotNull(lancada);
        Assert.Equal(142_000, item.KmProximaTroca);
        Assert.Equal(Hoje.AddMonths(6), item.DataProximaTroca);
        Assert.Same(_frota.UsuarioLogado, lancada.LancadoPor);
    }

    [Fact]
    public void Km_e_data_que_vieram_na_OS_valem()
    {
        var servico = _frota.CriarServicoOrdemServico();
        var item = Item(_frota.Oleo, kmProximaTroca: 150_000, dataProximaTroca: Hoje.AddMonths(4));

        Assert.NotNull(servico.Inserir(NovaOs(102_000, item)));
        Assert.Equal(150_000, item.KmProximaTroca);
        Assert.Equal(Hoje.AddMonths(4), item.DataProximaTroca);
    }

    [Fact]
    public void OS_com_km_maior_atualiza_o_caminhao_e_o_historico()
    {
        _frota.CriarServicoOrdemServico().Inserir(NovaOs(102_000, Item(_frota.Oleo)));

        Assert.Equal(102_000, _caminhao.KmAtual);
        var registro = Assert.Single(_caminhao.RegistrosKm);
        Assert.Equal(OrigemKm.OrdemServico, registro.Origem);
        Assert.Equal(100_000, registro.KmAnterior);
        Assert.Equal(102_000, registro.KmNovo);
    }

    [Fact]
    public void OS_com_km_menor_nao_baixa_o_km_do_caminhao()
    {
        Assert.NotNull(_frota.CriarServicoOrdemServico().Inserir(NovaOs(95_000, Item(_frota.Oleo))));

        Assert.Equal(100_000, _caminhao.KmAtual);
        Assert.Empty(_caminhao.RegistrosKm);
    }

    [Fact]
    public void OS_sem_item_nao_e_lancada()
    {
        var servico = _frota.CriarServicoOrdemServico();

        Assert.Null(servico.Inserir(NovaOs(102_000)));
        Assert.Contains("Escolha pelo menos um item trocado.", servico.Mensagens);
    }

    [Fact]
    public void OS_sem_mecanico_nao_e_lancada()
    {
        var servico = _frota.CriarServicoOrdemServico();
        var os = NovaOs(102_000, Item(_frota.Oleo));
        os.Mecanicos.Clear();

        Assert.Null(servico.Inserir(os));
        Assert.Contains("Escolha pelo menos um mecânico.", servico.Mensagens);
    }

    [Fact]
    public void OS_com_data_no_futuro_nao_e_lancada()
    {
        var servico = _frota.CriarServicoOrdemServico();
        var os = NovaOs(102_000, Item(_frota.Oleo));
        os.RealizadoEm = Hoje.AddDays(1);

        Assert.Null(servico.Inserir(os));
        Assert.Contains("A data da troca vai de 1900 até hoje.", servico.Mensagens);
    }

    [Fact]
    public void Proxima_troca_tem_que_ser_depois_do_km_da_OS()
    {
        var servico = _frota.CriarServicoOrdemServico();

        Assert.Null(servico.Inserir(NovaOs(102_000, Item(_frota.Oleo, kmProximaTroca: 100_000))));
        Assert.Contains("Óleo do motor: o km da próxima troca precisa ser maior que o km da troca.", servico.Mensagens);
    }

    [Fact]
    public void Mecanico_inativo_nao_entra_em_OS_nova()
    {
        var servico = _frota.CriarServicoOrdemServico();
        _mecanico.Ativo = false;

        Assert.Null(servico.Inserir(NovaOs(102_000, Item(_frota.Oleo))));
        Assert.Contains("O mecânico João está inativo. Ative o cadastro ou escolha outro.", servico.Mensagens);
    }

    [Fact]
    public void Item_sem_intervalo_precisa_do_km_da_proxima_troca()
    {
        var servico = _frota.CriarServicoOrdemServico();

        Assert.Null(servico.Inserir(NovaOs(102_000, Item(_frota.Embreagem))));
        Assert.Contains("Não há intervalo cadastrado para Embreagem. Informe o km da próxima troca ou cadastre o intervalo.",
            servico.Mensagens);
    }
}
