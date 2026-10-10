using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Resultados;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Padrão seguro usado quando o caminhão e a geração não têm intervalo cadastrado (ex.: dono de
/// um caminhão só, sem plano de concessionária), e a ordem em que os intervalos valem.
/// Os valores ficam abaixo do que Volvo, Scania, Mercedes, Iveco e DAF permitem, usando o limite do
/// óleo mineral, que é o mais curto.
/// Fonte: pesquisa em Intervalos_Volvo_FH_CheckTruck.docx e Intervalos_Scania_Mercedes_Iveco_DAF_CheckTruck.docx.
/// </summary>
public static class IntervalosPadrao
{
    public static IntervaloResolvido? Obter(Componente componente, NormaEmissao normaEmissao)
    {
        (int km, int meses)? padrao = componente switch
        {
            Componente.Motor => (normaEmissao == NormaEmissao.Euro6 ? 40_000 : 30_000, 6),
            Componente.Cambio => (120_000, 12),
            Componente.Diferencial1 => (120_000, 12),
            Componente.Diferencial2 => (120_000, 12),
            Componente.Filtro => (120_000, 12),
            _ => null, // Embreagem e outros: só com intervalo cadastrado
        };

        return padrao is null
            ? null
            : new IntervaloResolvido(OrigemIntervalo.Padrao, padrao.Value.km, padrao.Value.meses);
    }

    /// <summary>
    /// Os intervalos que existem para um item, na ordem em que valem: do caminhão → da empresa → de fábrica →
    /// padrão seguro. O primeiro é o que vale; sem ele, vale o seguinte. É o único lugar do sistema com essa ordem.
    /// </summary>
    public static IList<IntervaloResolvido> EmOrdem(
        IntervaloResolvido? doVeiculo,
        IntervaloResolvido? daEmpresa,
        IntervaloResolvido? deFabrica,
        Componente componente,
        NormaEmissao normaEmissao) =>
        new[] { doVeiculo, daEmpresa, deFabrica, Obter(componente, normaEmissao) }
            .OfType<IntervaloResolvido>()
            .Where(i => i.IntervaloKm > 0)
            .ToList();
}
