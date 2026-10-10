namespace CheckTruck.Dominio.Util;

/// <summary>
/// CNPJ com os dígitos verificadores certos. Aceita também o CNPJ alfanumérico (letras nas 12 primeiras
/// posições), que a Receita Federal emite desde julho de 2026: no cálculo, cada caractere vale o código
/// ASCII dele menos 48 (os números continuam valendo o próprio número).
/// </summary>
public static class CnpjUtil
{
    public static bool IsValid(string? valor)
    {
        var cnpj = RemoverMascaraCnpj(valor ?? "");
        if (cnpj.Length != 14
            || !cnpj[..12].All(char.IsAsciiLetterOrDigit)
            || !cnpj[12..].All(char.IsAsciiDigit)
            || cnpj.Distinct().Count() == 1)
        {
            return false;
        }

        return cnpj[12] - '0' == CalcularDigito(cnpj, 12) && cnpj[13] - '0' == CalcularDigito(cnpj, 13);
    }

    /// <summary>Tira pontos, barra, traço e espaços, e deixa as letras em maiúsculo.</summary>
    public static string RemoverMascaraCnpj(string cnpj) =>
        new string(cnpj.Where(c => c is not ('.' or '/' or '-' or ' ')).ToArray()).ToUpperInvariant();

    // Pesos de 2 a 9, da direita para a esquerda (ex.: 5 4 3 2 9 8 7 6 5 4 3 2 no primeiro dígito)
    private static int CalcularDigito(string cnpj, int tamanho)
    {
        var soma = 0;
        for (var i = 0; i < tamanho; i++)
        {
            soma += (cnpj[i] - '0') * ((tamanho - 1 - i) % 8 + 2);
        }

        var resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
