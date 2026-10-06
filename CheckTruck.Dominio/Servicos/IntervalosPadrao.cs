using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Resultados;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Padrão seguro usado quando o caminhão e o modelo não têm intervalo cadastrado (ex.: dono de
/// um caminhão só, sem plano de concessionária). Os valores ficam abaixo do que Volvo, Scania,
/// Mercedes, Iveco e DAF permitem, usando o limite do óleo mineral, que é o mais curto.
/// Fonte: pesquisa em Intervalos_Volvo_FH_CheckTruck.docx e Intervalos_Scania_Mercedes_Iveco_DAF_CheckTruck.docx.
/// </summary>
public static class IntervalosPadrao
{
    public static IntervaloResolvido? Obter(Componente componente, string? normaEmissao)
    {
        var euro6 = IsEuro6(normaEmissao);

        (int km, int meses)? padrao = componente switch
        {
            Componente.Motor => (euro6 ? 40_000 : 30_000, 6),
            Componente.Cambio => (120_000, 12),
            Componente.Diferencial1 => (120_000, 12),
            Componente.Diferencial2 => (120_000, 12),
            Componente.Filtro => (120_000, 12),
            _ => null, // Embreagem e outros: só com intervalo cadastrado
        };

        return padrao is null
            ? null
            : new IntervaloResolvido(padrao.Value.km, padrao.Value.meses, 0, OrigemIntervalo.Padrao);
    }

    /// <summary>Aceita "Euro 6", "Euro VI", "P8" e variações; qualquer outra coisa conta como Euro 5.</summary>
    public static bool IsEuro6(string? normaEmissao)
    {
        if (string.IsNullOrWhiteSpace(normaEmissao)) return false;

        var norma = normaEmissao.ToUpperInvariant().Replace(" ", "").Replace("-", "");
        return norma.Contains("EURO6") || norma.Contains("EUROVI") || norma.Contains("P8");
    }

    /// <summary>
    /// Prioridade: intervalo do caminhão → intervalo do modelo → padrão seguro.
    /// </summary>
    public static IntervaloResolvido? Resolver(
        (int km, int meses)? doVeiculo,
        (int km, int meses, int kmPrimeira)? doModelo,
        Componente componente,
        string? normaEmissao)
    {
        if (doVeiculo is { } v && v.km > 0)
        {
            return new IntervaloResolvido(v.km, v.meses, 0, OrigemIntervalo.Veiculo);
        }

        if (doModelo is { } m && m.km > 0)
        {
            return new IntervaloResolvido(m.km, m.meses, m.kmPrimeira, OrigemIntervalo.Modelo);
        }

        return Obter(componente, normaEmissao);
    }
}
