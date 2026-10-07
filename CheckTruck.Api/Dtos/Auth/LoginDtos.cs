using System.ComponentModel.DataAnnotations;

namespace CheckTruck.Api.Dtos.Auth;

public class LoginRequestDto
{
    [Required(ErrorMessage = "Informe o e-mail.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Informe a senha.")]
    public string Senha { get; set; } = "";
}
