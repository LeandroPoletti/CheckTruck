using CheckTruck.Api.Dtos.Mecanicos;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using CheckTruck.Repositorio.Entidades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Cadastro de mecânicos (nome e função), usado na OS. O mecânico pode ter, se precisar,
/// um login para consultar os caminhões pelo celular (papel "Mecanico").
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MecanicoController(
    ServicoCrud<Mecanico> servicoCrud,
    ServicoCrud<Manutencao> servicoManutencao,
    UserManager<Usuario> userManager,
    ILogger<Mecanico> logger)
    : CrudController<Mecanico, MecanicoResponseDto>(servicoCrud, "mecânico", logger, m => m.ToResponseDto())
{
    public const string PapelMecanico = "Mecanico";

    [HttpGet]
    public ActionResult<IEnumerable<MecanicoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<MecanicoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<MecanicoResponseDto> Post([FromBody] MecanicoRequestDto dto) => PostCore(dto.ToEntity());

    [HttpPut("{id:long}")]
    public ActionResult<MecanicoResponseDto> Put(long id, [FromBody] MecanicoRequestDto dto)
    {
        // O login (se houver) não vem no formulário: mantém o que já estava gravado
        var original = Servico.Query(m => m.Id == id).Select(m => new { m.UsuarioGuid }).FirstOrDefault();
        if (original is null)
        {
            return NotFound();
        }

        var entidade = dto.ToEntity();
        entidade.UsuarioGuid = original.UsuarioGuid;
        return PutCore(id, entidade);
    }

    /// <summary>
    /// Só exclui mecânico sem OS lançada; com histórico, o certo é desativar.
    /// Se ele tiver login, o login também é apagado.
    /// </summary>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        if (servicoManutencao.Query(m => m.Mecanico.Id == id).Any())
        {
            return BadRequest("Esse mecânico tem OS lançadas. Desative o cadastro em vez de excluir.");
        }

        var usuarioGuid = Servico.Query(m => m.Id == id).Select(m => m.UsuarioGuid).FirstOrDefault();
        var resultado = DeleteCore(id);
        if (resultado is NoContentResult && usuarioGuid is not null)
        {
            var usuario = await userManager.FindByIdAsync(usuarioGuid);
            if (usuario is not null)
            {
                await userManager.DeleteAsync(usuario);
            }
        }

        return resultado;
    }

    /// <summary>
    /// Cria o login do mecânico (o e-mail vira o usuário) com o papel "Mecanico".
    /// Com esse login ele entra na área do mecânico, só para consultar.
    /// </summary>
    [HttpPost("{id:long}/acesso")]
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Administrador")]
    public async Task<ActionResult<MecanicoResponseDto>> DarAcesso(long id, [FromBody] AcessoMecanicoRequestDto dto)
    {
        var mecanico = Servico.GetById(id);
        if (mecanico is null)
        {
            return NotFound();
        }

        if (mecanico.UsuarioGuid is not null)
        {
            return BadRequest("Esse mecânico já tem acesso.");
        }

        var email = dto.Email.Trim();
        var usuario = new Usuario { UserName = email, Email = email, Ativo = true };
        var criado = await userManager.CreateAsync(usuario, dto.Senha);
        if (!criado.Succeeded)
        {
            return BadRequest(string.Join(" ", criado.Errors.Select(TraduzirErro)));
        }

        await userManager.AddToRoleAsync(usuario, PapelMecanico);

        mecanico.UsuarioGuid = usuario.Id;
        if (Servico.Atualizar(mecanico) is null)
        {
            await userManager.DeleteAsync(usuario); // não deixa login solto sem mecânico
            return BadRequest(string.Join(" ", Servico.Mensagens));
        }

        return mecanico.ToResponseDto();
    }

    /// <summary>Tira o login do mecânico. O cadastro e o histórico de OS continuam.</summary>
    [HttpDelete("{id:long}/acesso")]
    [Authorize(AuthenticationSchemes = "Identity.Bearer", Roles = "Administrador")]
    public async Task<ActionResult<MecanicoResponseDto>> RemoverAcesso(long id)
    {
        var mecanico = Servico.GetById(id);
        if (mecanico is null)
        {
            return NotFound();
        }

        if (mecanico.UsuarioGuid is null)
        {
            return BadRequest("Esse mecânico não tem acesso.");
        }

        var usuario = await userManager.FindByIdAsync(mecanico.UsuarioGuid);
        mecanico.UsuarioGuid = null;
        if (Servico.Atualizar(mecanico) is null)
        {
            return BadRequest(string.Join(" ", Servico.Mensagens));
        }

        if (usuario is not null)
        {
            await userManager.DeleteAsync(usuario);
        }

        return mecanico.ToResponseDto();
    }

    // Mensagens do Identity vêm em inglês; traduz as mais comuns
    private static string TraduzirErro(IdentityError erro) => erro.Code switch
    {
        "DuplicateUserName" or "DuplicateEmail" => "Já existe um login com esse e-mail.",
        "InvalidEmail" => "E-mail inválido.",
        "PasswordTooShort" => "A senha precisa ter pelo menos 6 caracteres.",
        "PasswordRequiresDigit" => "A senha precisa ter um número.",
        "PasswordRequiresLower" => "A senha precisa ter uma letra minúscula.",
        "PasswordRequiresUpper" => "A senha precisa ter uma letra maiúscula.",
        "PasswordRequiresNonAlphanumeric" => "A senha precisa ter um símbolo (ex.: @).",
        _ => erro.Description
    };
}
