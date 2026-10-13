using CheckTruck.Api.Dtos.Auth;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    SignInManager<Usuario> signInManager,
    ServicoEmpresa servicoEmpresa,
    IOptionsMonitor<BearerTokenOptions> opcoesDoToken) : CheckTruckController
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
    /// O accessToken vale 1 hora; depois o front pede outro em POST api/Auth/renovar, sem pedir a senha.
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

    /// <summary>
    /// Troca a chave de renovação (refreshToken) por tokens novos, sem pedir a senha. Devolve o mesmo que o login.
    /// A chave vale 14 dias (cada renovação dá uma nova). Chave vencida ou inválida, senha ou e-mail trocados
    /// (muda o carimbo de segurança) ou acesso desativado: 401, e a pessoa entra de novo.
    /// </summary>
    [HttpPost("renovar")]
    public async Task<IActionResult> Renovar([FromBody] RenovarRequestDto dto)
    {
        var chave = opcoesDoToken.Get(IdentityConstants.BearerScheme).RefreshTokenProtector.Unprotect(dto.RefreshToken);
        if (chave?.Properties.ExpiresUtc is not { } vence || DateTimeOffset.UtcNow >= vence
            || await signInManager.ValidateSecurityStampAsync(chave.Principal) is not { Ativo: true } usuario)
        {
            return Erro("Sua sessão acabou. Entre de novo.", StatusCodes.Status401Unauthorized);
        }

        // Como no login: o próprio SignInManager escreve os tokens novos na resposta
        signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
        await signInManager.SignInAsync(usuario, isPersistent: false);
        return new EmptyResult();
    }
}
