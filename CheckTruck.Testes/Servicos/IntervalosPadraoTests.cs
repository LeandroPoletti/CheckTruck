using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Resultados;
using CheckTruck.Dominio.Servicos;

namespace CheckTruck.Testes.Servicos;

public class IntervalosPadraoTests
{
    [Theory]
    [InlineData(Componente.Motor, NormaEmissao.Euro6, 40_000, 6)]
    [InlineData(Componente.Motor, NormaEmissao.Euro5, 30_000, 6)]
    [InlineData(Componente.Motor, NormaEmissao.AntesDoEuro5, 30_000, 6)]
    [InlineData(Componente.Cambio, NormaEmissao.Euro6, 120_000, 12)]
    [InlineData(Componente.Diferencial1, NormaEmissao.Euro5, 120_000, 12)]
    [InlineData(Componente.Filtro, NormaEmissao.Euro6, 120_000, 12)]
    public void Padrao_seguro_por_componente_e_norma(Componente componente, NormaEmissao norma, int km, int meses)
    {
        var padrao = IntervalosPadrao.Obter(componente, norma);

        Assert.NotNull(padrao);
        Assert.Equal(OrigemIntervalo.Padrao, padrao.Origem);
        Assert.Equal(km, padrao.IntervaloKm);
        Assert.Equal(meses, padrao.IntervaloMeses);
    }

    [Fact]
    public void Embreagem_nao_tem_padrao() =>
        Assert.Null(IntervalosPadrao.Obter(Componente.Embreagem, NormaEmissao.Euro6));

    [Fact]
    public void Ordem_e_caminhao_empresa_fabrica_e_padrao()
    {
        var doCaminhao = new IntervaloResolvido(OrigemIntervalo.Veiculo, 25_000, 0);
        var daEmpresa = new IntervaloResolvido(OrigemIntervalo.Empresa, 35_000, 0);
        var deFabrica = new IntervaloResolvido(OrigemIntervalo.Fabrica, 50_000, 0);

        var emOrdem = IntervalosPadrao.EmOrdem(doCaminhao, daEmpresa, deFabrica, Componente.Motor, NormaEmissao.Euro6);

        Assert.Equal(
            new[] { OrigemIntervalo.Veiculo, OrigemIntervalo.Empresa, OrigemIntervalo.Fabrica, OrigemIntervalo.Padrao },
            emOrdem.Select(i => i.Origem));
    }

    [Fact]
    public void Intervalo_com_km_zero_e_ignorado()
    {
        var doCaminhaoSemKm = new IntervaloResolvido(OrigemIntervalo.Veiculo, 0, 6);

        var emOrdem = IntervalosPadrao.EmOrdem(doCaminhaoSemKm, null, null, Componente.Motor, NormaEmissao.Euro6);

        Assert.Equal(OrigemIntervalo.Padrao, Assert.Single(emOrdem).Origem);
    }

    [Fact]
    public void Embreagem_sem_cadastro_nao_tem_intervalo() =>
        Assert.Empty(IntervalosPadrao.EmOrdem(null, null, null, Componente.Embreagem, NormaEmissao.Euro6));
}
