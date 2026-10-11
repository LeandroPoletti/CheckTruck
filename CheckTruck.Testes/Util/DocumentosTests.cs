using CheckTruck.Dominio.Util;

namespace CheckTruck.Testes.Util;

public class DocumentosTests
{
    [Theory]
    [InlineData("529.982.247-25")]
    [InlineData("52998224725")]
    [InlineData("123.456.789-09")]
    public void Cpf_com_digitos_certos_passa(string cpf) => Assert.True(CpfUtil.IsValid(cpf));

    [Theory]
    [InlineData("529.982.247-24")]
    [InlineData("111.111.111-11")]
    [InlineData("123.456.789-00")]
    [InlineData("1234567890")]
    [InlineData("abc.def.ghi-jk")]
    public void Cpf_errado_nao_passa(string cpf) => Assert.False(CpfUtil.IsValid(cpf));

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Cpf_vazio_passa_porque_e_conferido_em_outro_lugar(string? cpf) => Assert.True(CpfUtil.IsValid(cpf));

    [Theory]
    [InlineData("11.222.333/0001-81")]
    [InlineData("12.ABC.345/01DE-35")]
    [InlineData("12abc34501de35")]
    public void Cnpj_com_digitos_certos_passa_inclusive_o_alfanumerico(string cnpj) => Assert.True(CnpjUtil.IsValid(cnpj));

    [Theory]
    [InlineData("11.222.333/0001-80")]
    [InlineData("11.222.333/0001-8A")]
    [InlineData("00.000.000/0000-00")]
    [InlineData("")]
    [InlineData(null)]
    public void Cnpj_errado_nao_passa(string? cnpj) => Assert.False(CnpjUtil.IsValid(cnpj));
}
