using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Util;

namespace CheckTruck.Dominio.Attributes;

[AttributeUsage(AttributeTargets.Property, AllowMultiple = true, Inherited = true)]
public class CpfAttribute : ValidationAttribute
{
    public CpfAttribute() : base("CPF inválido.")
    {
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (CpfUtil.IsValid(value?.ToString()))
        {
            return ValidationResult.Success;
        }

        return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));
    }
}
