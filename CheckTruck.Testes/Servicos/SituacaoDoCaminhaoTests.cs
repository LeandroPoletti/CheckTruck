using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Resultados;
using CheckTruck.Testes.Apoio;

namespace CheckTruck.Testes.Servicos;

/// <summary>
/// Situação de manutenção de um caminhão (ServicoSituacaoVeiculo): próxima troca, quanto falta e status de cada item.
/// A frota de teste é um FH Euro 6: padrão do óleo do motor 40.000 km / 6 meses e do diferencial 120.000 km / 12 meses.
/// </summary>
public class SituacaoDoCaminhaoTests
{
    private static readonly DateTime Hoje = DateTime.UtcNow.Date;

    private static ItemManutencao Item(SituacaoVeiculo situacao, long tipoId) =>
        Assert.Single(situacao.Itens, i => i.TipoManutencaoId == tipoId);

    private static SituacaoVeiculo Situacao(Frota frota, long veiculoId = 1)
    {
        var situacao = frota.CriarServicoSituacao().ObterSituacao(veiculoId);
        Assert.NotNull(situacao);
        return situacao;
    }

    [Fact]
    public void Item_sem_OS_conta_a_partir_do_km_de_entrada()
    {
        var frota = new Frota();
        frota.Caminhao(kmDeEntrada: 100_000);

        var oleo = Item(Situacao(frota), frota.Oleo.Id);

        // Supõe as trocas de antes da entrada feitas: 40k, 80k... a próxima depois de 100.000 é 120.000
        Assert.Equal(120_000, oleo.KmProximaTroca);
        Assert.Equal(20_000, oleo.KmRestante);
        Assert.False(oleo.IsPrimeiraTroca);
        Assert.Null(oleo.UltimaTrocaKm);
        Assert.Equal(OrigemIntervalo.Padrao, oleo.OrigemIntervalo);
        Assert.Equal(StatusManutencao.Ok, oleo.Status);
    }

    [Fact]
    public void Item_sem_OS_que_passou_do_km_vence_e_nao_aparece_como_trocado()
    {
        // Bug corrigido: depois da entrada, só a OS conta como troca. Rodar além do km sem OS é vencido.
        var frota = new Frota();
        frota.Caminhao(kmDeEntrada: 100_000, kmAtual: 125_000);

        var oleo = Item(Situacao(frota), frota.Oleo.Id);

        Assert.Equal(120_000, oleo.KmProximaTroca);
        Assert.Equal(-5_000, oleo.KmRestante);
        Assert.Equal(StatusManutencao.Critico, oleo.Status);
    }

    [Fact]
    public void Caminhao_novo_usa_o_km_da_primeira_troca()
    {
        var frota = new Frota();
        frota.IntervaloDeFabrica(frota.Diferencial, km: 120_000, meses: 12, kmPrimeira: 10_000);
        frota.Caminhao(kmDeEntrada: 2_000);

        var diferencial = Item(Situacao(frota), frota.Diferencial.Id);

        Assert.True(diferencial.IsPrimeiraTroca);
        Assert.Equal(10_000, diferencial.KmProximaTroca);
        Assert.Equal(8_000, diferencial.KmRestante);
        Assert.Equal(OrigemIntervalo.Fabrica, diferencial.OrigemIntervalo);
    }

    [Fact]
    public void Com_OS_vale_a_proxima_troca_gravada_no_item()
    {
        var frota = new Frota();
        var caminhao = frota.Caminhao(kmDeEntrada: 90_000, kmAtual: 110_000);
        frota.OsLancada(caminhao, Hoje.AddDays(-30), km: 100_000, frota.Oleo, kmProximaTroca: 140_000, dataProximaTroca: Hoje.AddDays(150));

        var oleo = Item(Situacao(frota), frota.Oleo.Id);

        Assert.Equal(100_000, oleo.UltimaTrocaKm);
        Assert.Equal(140_000, oleo.KmProximaTroca);
        Assert.Equal(30_000, oleo.KmRestante);
        Assert.Equal(150, oleo.DiasRestantes);
        Assert.Equal(25, oleo.PercentualUsado);
        Assert.Equal(StatusManutencao.Ok, oleo.Status);
    }

    [Fact]
    public void Vale_a_OS_mais_nova_do_item()
    {
        var frota = new Frota();
        var caminhao = frota.Caminhao(kmDeEntrada: 50_000, kmAtual: 110_000);
        frota.OsLancada(caminhao, Hoje.AddDays(-200), km: 60_000, frota.Oleo, kmProximaTroca: 100_000);
        frota.OsLancada(caminhao, Hoje.AddDays(-30), km: 100_000, frota.Oleo, kmProximaTroca: 140_000);

        var oleo = Item(Situacao(frota), frota.Oleo.Id);

        Assert.Equal(100_000, oleo.UltimaTrocaKm);
        Assert.Equal(140_000, oleo.KmProximaTroca);
    }

    [Fact]
    public void Intervalo_do_caminhao_vale_antes_de_todos()
    {
        var frota = new Frota();
        var caminhao = frota.Caminhao(kmDeEntrada: 10_000);
        frota.IntervaloDeFabrica(frota.Oleo, km: 50_000);
        frota.IntervaloDaEmpresa(frota.Oleo, km: 45_000);
        frota.IntervaloDoCaminhao(caminhao, frota.Oleo, km: 25_000);

        var oleo = Item(Situacao(frota), frota.Oleo.Id);

        Assert.Equal(OrigemIntervalo.Veiculo, oleo.OrigemIntervalo);
        Assert.Equal(25_000, oleo.IntervaloKm);
    }

    [Fact]
    public void Intervalo_da_empresa_vale_antes_do_de_fabrica()
    {
        var frota = new Frota();
        frota.Caminhao(kmDeEntrada: 10_000);
        frota.IntervaloDeFabrica(frota.Oleo, km: 50_000);
        frota.IntervaloDaEmpresa(frota.Oleo, km: 45_000);

        var oleo = Item(Situacao(frota), frota.Oleo.Id);

        Assert.Equal(OrigemIntervalo.Empresa, oleo.OrigemIntervalo);
        Assert.Equal(45_000, oleo.IntervaloKm);
    }

    [Fact]
    public void Ciclo_grande_avisa_com_10_por_cento()
    {
        // Diferencial trocado em 100.000 (próxima em 220.000) e caminhão com 210.000: faltam 10.000,
        // dentro da margem de 12.000 (10% de 120.000). Com a margem fixa antiga (5.000) ficaria OK.
        var frota = new Frota();
        var caminhao = frota.Caminhao(kmDeEntrada: 90_000, kmAtual: 210_000);
        frota.OsLancada(caminhao, Hoje.AddDays(-60), km: 100_000, frota.Diferencial, kmProximaTroca: 220_000);

        var diferencial = Item(Situacao(frota), frota.Diferencial.Id);

        Assert.Equal(12_000, diferencial.MargemAlertaKm);
        Assert.Equal(StatusManutencao.Atencao, diferencial.Status);
    }

    [Theory]
    [InlineData(10, StatusManutencao.Atencao)]
    [InlineData(-1, StatusManutencao.Critico)]
    public void Data_perto_ou_vencida_pesa_mesmo_com_km_sobrando(int diasParaVencer, StatusManutencao esperado)
    {
        var frota = new Frota();
        var caminhao = frota.Caminhao(kmDeEntrada: 90_000, kmAtual: 101_000);
        frota.OsLancada(caminhao, Hoje.AddDays(-170), km: 100_000, frota.Oleo, kmProximaTroca: 140_000,
            dataProximaTroca: Hoje.AddDays(diasParaVencer));

        var oleo = Item(Situacao(frota), frota.Oleo.Id);

        Assert.Equal(39_000, oleo.KmRestante);
        Assert.Equal(esperado, oleo.Status);
    }

    [Fact]
    public void Item_sem_intervalo_e_sem_padrao_nao_aparece()
    {
        var frota = new Frota();
        frota.Caminhao(kmDeEntrada: 10_000);

        Assert.DoesNotContain(Situacao(frota).Itens, i => i.TipoManutencaoId == frota.Embreagem.Id);
    }

    [Fact]
    public void Status_do_caminhao_e_o_pior_item()
    {
        // Óleo vencido (sem OS, passou dos 120.000) e diferencial OK (intervalo de fábrica de 300.000 km)
        var frota = new Frota();
        frota.IntervaloDeFabrica(frota.Diferencial, km: 300_000);
        frota.Caminhao(kmDeEntrada: 100_000, kmAtual: 125_000);

        var situacao = Situacao(frota);

        Assert.Equal(StatusManutencao.Ok, Item(situacao, frota.Diferencial.Id).Status);
        Assert.Equal(StatusManutencao.Critico, situacao.Status);
        Assert.NotNull(situacao.ItemMaisUrgente);
        Assert.Equal(frota.Oleo.Id, situacao.ItemMaisUrgente.TipoManutencaoId);
    }

    [Fact]
    public void Resolve_o_intervalo_que_vale_para_a_OS()
    {
        var frota = new Frota();
        var caminhao = frota.Caminhao(kmDeEntrada: 10_000);
        frota.IntervaloDoCaminhao(caminhao, frota.Oleo, km: 25_000, meses: 3);

        var intervalo = frota.CriarServicoSituacao().ResolverIntervalo(caminhao.Id, frota.Oleo.Id);

        Assert.NotNull(intervalo);
        Assert.Equal(OrigemIntervalo.Veiculo, intervalo.Origem);
        Assert.Equal(25_000, intervalo.IntervaloKm);
        Assert.Null(frota.CriarServicoSituacao().ResolverIntervalo(veiculoId: 99, frota.Oleo.Id));
    }
}
