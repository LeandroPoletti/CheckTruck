namespace CheckTruck.Dominio.Util;

public static class CpfUtil
{
    public static bool IsValid(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return true;
        }

        var cpf = RemoverMascaraCpf(value);

        if (cpf.Length != 11 || cpf.Distinct().Count() == 1)
        {
            return false;
        }

        var firstDigit = CalculateDigit(cpf, 9);
        var secondDigit = CalculateDigit(cpf, 10);

        return cpf[9] - '0' == firstDigit && cpf[10] - '0' == secondDigit;
    }

    private static int CalculateDigit(string cpf, int length)
    {
        var sum = 0;

        for (var i = 0; i < length; i++)
        {
            sum += (cpf[i] - '0') * (length + 1 - i);
        }

        var remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
    
    public static string RemoverMascaraCpf(string cpf)
    {
        if (string.IsNullOrEmpty(cpf))
        {
            return string.Empty;
        }

        return cpf.Replace(".", "").Replace("-", "");
    }
}
