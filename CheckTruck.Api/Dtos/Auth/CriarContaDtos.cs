using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Enums;

namespace CheckTruck.Api.Dtos.Auth;

/// <summary>Tela Criar conta. Frota: nome da empresa e CNPJ. Autônomo: a conta leva o nome e o CPF da pessoa.</summary>
public class CriarContaRequestDto
{
    [Required(ErrorMessage = "Escolha Frota ou Autônomo.")]
    public TipoConta? TipoConta { get; set; }

    /// <summary>Só na Frota.</summary>
    [StringLength(150)]
    public string? NomeEmpresa { get; set; }

    /// <summary>Só na Frota. Com ou sem máscara; aceita o CNPJ com letras.</summary>
    public string? Cnpj { get; set; }

    [Required(ErrorMessage = "Informe o seu nome.")]
    [StringLength(150)]
    public string Nome { get; set; } = "";

    /// <summary>Com ou sem máscara.</summary>
    [Required(ErrorMessage = "Informe o CPF.")]
    public string Cpf { get; set; } = "";

    [Required(ErrorMessage = "Informe o e-mail.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Informe a senha.")]
    public string Senha { get; set; } = "";
}
