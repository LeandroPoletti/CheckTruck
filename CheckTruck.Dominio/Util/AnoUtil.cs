namespace CheckTruck.Dominio.Util;

/// <summary>
/// Limite de ano usado em todo o sistema. O primeiro caminhão é de 1896, então nada antes de 1900;
/// e nada depois do ano que vem, porque o ano-modelo pode ser o do ano seguinte.
/// </summary>
public static class AnoUtil
{
    public const int AnoMinimo = 1900;

    public static int AnoMaximo => DateTime.UtcNow.Year + 1;

    public static bool IsValido(int ano) => ano >= AnoMinimo && ano <= AnoMaximo;
}
