using CheckTruck.Api.Dtos.Auth;
using CheckTruck.Dominio.Entidades;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(SignInManager<Usuario> signInManager) : ControllerBase
{
    /// <summary>
    /// Entra com e-mail e senha. Devolve { tokenType, accessToken, expiresIn, refreshToken };
    /// o front manda o accessToken no cabeçalho Authorization: Bearer. Acesso inativo não entra.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        // Com o esquema Bearer, o próprio SignInManager escreve o token na resposta
        signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
        var resultado = await signInManager.PasswordSignInAsync(
            dto.Email.Trim(), dto.Senha, isPersistent: false, lockoutOnFailure: true);

        if (resultado.Succeeded)
        {
            return new EmptyResult();
        }

        if (resultado.IsNotAllowed)
        {
            return Unauthorized("Seu acesso está desativado. Fale com o admin ou o gestor.");
        }

        if (resultado.IsLockedOut)
        {
            return Unauthorized("Muitas tentativas erradas. Espere alguns minutos e tente de novo.");
        }

        return Unauthorized("E-mail ou senha inválidos.");
    }
}
