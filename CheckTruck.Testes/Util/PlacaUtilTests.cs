using CheckTruck.Dominio.Util;

namespace CheckTruck.Testes.Util;

public class PlacaUtilTests
{
    [Theory]
    [InlineData("abc1d23", "ABC-1D23")]
    [InlineData("ABC-1D23", "ABC-1D23")]
    [InlineData("abc-1234", "ABC-1234")]
    [InlineData(" abc 1234 ", "ABC-1234")]
    [InlineData("abc.1d23", "ABC-1D23")]
    public void Placa_digitada_de_qualquer_jeito_fica_no_padrao(string digitada, string esperada) =>
        Assert.Equal(esperada, PlacaUtil.Formatar(digitada));

    [Theory]
    [InlineData("AB12345")]
    [InlineData("ABCD123")]
    [InlineData("ABC12D3")]
    [InlineData("ABC123")]
    [InlineData("")]
    [InlineData(null)]
    public void Placa_invalida_volta_null(string? digitada) =>
        Assert.Null(PlacaUtil.Formatar(digitada));
}
