using CheckTruck.Api.Dtos.Auth;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(SignInManager<Usuario> signInManager, ServicoEmpresa servicoEmpresa) : CheckTruckController
{
    /// <summary>
    /// Cria a conta de um cliente novo: a empresa (Frota ou Autônomo) e o primeiro acesso, que é Admin.
    /// Não precisa estar logado. Depois o front entra com o e-mail e a senha (POST api/Auth/login).
    /// </summary>
    [HttpPost("criar-conta")]
    public async Task<IActionResult> CriarConta([FromBody] CriarContaRequestDto dto)
    {
        var usuario = await servicoEmpresa.CriarContaAsync(
            dto.TipoConta!.Value, dto.NomeEmpresa, dto.Cnpj, dto.Nome, dto.Cpf, dto.Email, dto.Senha);
        if (usuario is null)
        {
            return Erro(servicoEmpresa.Mensagens);
        }

        return NoContent();
    }

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
            return Erro("Seu acesso está desativado. Fale com o admin ou o gestor.", StatusCodes.Status401Unauthorized);
        }

        if (resultado.IsLockedOut)
        {
            return Erro("Muitas tentativas erradas. Espere alguns minutos e tente de novo.", StatusCodes.Status401Unauthorized);
        }

        return Erro("E-mail ou senha inválidos.", StatusCodes.Status401Unauthorized);
    }
}
