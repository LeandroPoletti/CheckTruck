using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Resultados;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Padrão seguro usado quando o caminhão e a geração não têm intervalo cadastrado (ex.: dono de
/// um caminhão só, sem plano de concessionária). Os valores ficam abaixo do que Volvo, Scania,
/// Mercedes, Iveco e DAF permitem, usando o limite do óleo mineral, que é o mais curto.
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
            : new IntervaloResolvido(padrao.Value.km, padrao.Value.meses, 0, OrigemIntervalo.Padrao);
    }

    /// <summary>
    /// Prioridade: intervalo do caminhão → da empresa → de fábrica → padrão seguro.
    /// daGeracao é o da empresa, quando ela tem, ou o de fábrica (daEmpresa diz qual dos dois).
    /// </summary>
    public static IntervaloResolvido? Resolver(
        (int km, int meses)? doVeiculo,
        (int km, int meses, int kmPrimeira, bool daEmpresa)? daGeracao,
        Componente componente,
        NormaEmissao normaEmissao)
    {
        if (doVeiculo is { } v && v.km > 0)
        {
            return new IntervaloResolvido(v.km, v.meses, 0, OrigemIntervalo.Veiculo);
        }

        if (daGeracao is { } g && g.km > 0)
        {
            return new IntervaloResolvido(g.km, g.meses, g.kmPrimeira, g.daEmpresa ? OrigemIntervalo.Empresa : OrigemIntervalo.Geracao);
        }

        return Obter(componente, normaEmissao);
    }
}
