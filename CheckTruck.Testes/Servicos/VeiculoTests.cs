using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Testes.Apoio;

namespace CheckTruck.Testes.Servicos;

/// <summary>Cadastro do caminhão (ServicoVeiculo.Valida) e Atualizar km.</summary>
public class VeiculoTests
{
    private readonly Frota _frota = new();

    private Veiculo NovoCaminhao(string placa, int anoFabricacao = 2023, int anoModelo = 2024, string? renavam = null) => new()
    {
        Placa = placa,
        Chassi = "9BVNOVO0000000001",
        Potencia = _frota.Potencia,
        Tracao = Tracao.SeisPorDois,
        AnoFabricacao = new DateTime(anoFabricacao, 1, 1),
        AnoModelo = new DateTime(anoModelo, 1, 1),
        Renavam = renavam,
        Ativo = true,
    };

    [Fact]
    public void Placa_digitada_de_qualquer_jeito_e_gravada_no_padrao()
    {
        var caminhao = NovoCaminhao("abc1d23");

        Assert.True(_frota.CriarServicoVeiculo().Valida(caminhao));
        Assert.Equal("ABC-1D23", caminhao.Placa);
    }

    [Fact]
    public void Placa_invalida_nao_passa()
    {
        var servico = _frota.CriarServicoVeiculo();

        Assert.False(servico.Valida(NovoCaminhao("AB12345")));
        Assert.Contains("Placa inválida. Use o padrão ABC-1234 ou ABC-1D23.", servico.Mensagens);
    }

    [Fact]
    public void Placa_repetida_na_empresa_nao_passa()
    {
        _frota.Caminhao(kmDeEntrada: 10_000); // placa ABC-1D21
        var servico = _frota.CriarServicoVeiculo();

        Assert.False(servico.Valida(NovoCaminhao("abc1d21")));
        Assert.Contains("Já existe um caminhão com essa placa.", servico.Mensagens);
    }

    [Theory]
    [InlineData(2019, 2019)]
    [InlineData(2019, 2020)]
    public void Ano_modelo_e_o_de_fabricacao_ou_o_seguinte(int fabricacao, int modelo) =>
        Assert.True(_frota.CriarServicoVeiculo().Valida(NovoCaminhao("ABC1234", fabricacao, modelo)));

    [Theory]
    [InlineData(2019, 2021)]
    [InlineData(2019, 2018)]
    public void Ano_modelo_longe_do_de_fabricacao_nao_passa(int fabricacao, int modelo)
    {
        var servico = _frota.CriarServicoVeiculo();

        Assert.False(servico.Valida(NovoCaminhao("ABC1234", fabricacao, modelo)));
        Assert.Contains("O ano modelo é o ano de fabricação ou o seguinte (ex.: fabricado em 2019, modelo 2019 ou 2020).",
            servico.Mensagens);
    }

    [Fact]
    public void Renavam_quando_vem_tem_11_numeros()
    {
        var servico = _frota.CriarServicoVeiculo();

        Assert.False(servico.Valida(NovoCaminhao("ABC1234", renavam: "1234567890")));
        Assert.Contains("O Renavam tem 11 números.", servico.Mensagens);
    }

    [Fact]
    public void Atualizar_km_grava_o_km_do_painel()
    {
        var caminhao = _frota.Caminhao(kmDeEntrada: 10_000);
        var servico = _frota.CriarServicoVeiculo();

        Assert.True(servico.AtualizarKmVeiculo(caminhao.Id, kmDoPainel: 12_500));
        Assert.Equal(12_500, caminhao.KmAtual);
    }

    [Fact]
    public void Atualizar_km_precisa_de_km_maior_que_o_registrado()
    {
        var caminhao = _frota.Caminhao(kmDeEntrada: 10_000);
        var servico = _frota.CriarServicoVeiculo();

        Assert.False(servico.AtualizarKmVeiculo(caminhao.Id, kmDoPainel: 10_000));
        Assert.Contains("Informe um km maior que o atual (10.000 km). Se o atual está errado, peça para o Admin ou o Gestor usar Corrigir km.",
            servico.Mensagens);
        Assert.Equal(10_000, caminhao.KmAtual);
    }
}
