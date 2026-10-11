using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;

namespace CheckTruck.Testes.Servicos;

/// <summary>RN-08: atenção quando falta 10% do ciclo (no mínimo 5.000 km) ou 30 dias; crítico quando venceu.</summary>
public class RegrasDeAlertaTests
{
    [Theory]
    [InlineData(40_000, 5_000)]
    [InlineData(50_000, 5_000)]
    [InlineData(60_000, 6_000)]
    [InlineData(120_000, 12_000)]
    public void Margem_de_km_e_10_por_cento_do_ciclo_com_minimo_de_5000(int kmDoCiclo, int margemEsperada) =>
        Assert.Equal(margemEsperada, ServicoSituacaoVeiculo.MargemAlertaKm(kmDoCiclo));

    [Theory]
    [InlineData(-1, StatusManutencao.Critico)]
    [InlineData(0, StatusManutencao.Critico)]
    [InlineData(5_000, StatusManutencao.Atencao)]
    [InlineData(5_001, StatusManutencao.Ok)]
    public void Status_pelo_km_que_falta(int kmRestante, StatusManutencao esperado) =>
        Assert.Equal(esperado, ServicoSituacaoVeiculo.StatusPorKmRestante(kmRestante, margemAlertaKm: 5_000));

    [Theory]
    [InlineData(null, StatusManutencao.Ok)]
    [InlineData(-3, StatusManutencao.Critico)]
    [InlineData(0, StatusManutencao.Critico)]
    [InlineData(30, StatusManutencao.Atencao)]
    [InlineData(31, StatusManutencao.Ok)]
    public void Status_pelos_dias_que_faltam(int? diasRestantes, StatusManutencao esperado) =>
        Assert.Equal(esperado, ServicoSituacaoVeiculo.StatusPorDiasRestantes(diasRestantes));

    [Fact]
    public void Data_da_proxima_troca_soma_os_meses()
    {
        Assert.Equal(new DateTime(2026, 9, 10), ServicoSituacaoVeiculo.CalcularDataProximaTroca(new DateTime(2026, 3, 10), 6));
        Assert.Equal(new DateTime(2026, 2, 28), ServicoSituacaoVeiculo.CalcularDataProximaTroca(new DateTime(2026, 1, 31), 1));
    }

    [Fact]
    public void Intervalo_sem_meses_nao_tem_data() =>
        Assert.Null(ServicoSituacaoVeiculo.CalcularDataProximaTroca(new DateTime(2026, 3, 10), 0));
}
