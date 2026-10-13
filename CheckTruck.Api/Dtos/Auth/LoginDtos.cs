using System.ComponentModel.DataAnnotations;

namespace CheckTruck.Api.Dtos.Auth;

public class LoginRequestDto
{
    [Required(ErrorMessage = "Informe o e-mail.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Informe a senha.")]
    public string Senha { get; set; } = "";
}

/// <summary>A chave de renovação (refreshToken) que veio no login ou na última renovação.</summary>
public class RenovarRequestDto
{
    [Required(ErrorMessage = "Sua sessão acabou. Entre de novo.")]
    public string RefreshToken { get; set; } = "";
}
