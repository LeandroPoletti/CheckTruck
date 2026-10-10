using System.Text.RegularExpressions;

namespace CheckTruck.Dominio.Util;

/// <summary>
/// Placa do caminhão. Pode ser digitada de qualquer jeito (abc1d23, ABC-1D23, abc 1234...);
/// o sistema grava e mostra maiúscula e com hífen: ABC-1234 (antiga) ou ABC-1D23 (Mercosul).
/// </summary>
public static class PlacaUtil
{
    // 3 letras, 1 número, 1 letra ou número e 2 números (sem o hífen)
    private static readonly Regex Padrao = new("^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$");

    /// <summary>A placa no formato do sistema (ABC-1D23); null quando não é uma placa válida.</summary>
    public static string? Formatar(string? placa)
    {
        var limpa = new string((placa ?? "").Where(char.IsAsciiLetterOrDigit).ToArray()).ToUpperInvariant();
        return Padrao.IsMatch(limpa) ? $"{limpa[..3]}-{limpa[3..]}" : null;
    }
}
