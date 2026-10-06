using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using CheckTruck.Repositorio.Entidades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>Quem está logado e qual o perfil dele.</summary>
[ApiController]
[Route("api/[controller]")]
public class UsuarioController(
    UserManager<Usuario> userManager,
    ServicoCrud<Mecanico> servicoMecanico,
    ServicoCrud<Motorista> servicoMotorista) : ControllerBase
{
    /// <summary>
    /// Usuário logado com o perfil que o front usa para escolher a área:
    /// "gerente" (papel Administrador), "mecanico" ou "motorista".
    /// </summary>
    [HttpGet("me")]
    [Authorize(AuthenticationSchemes = "Identity.Bearer")]
    public async Task<ActionResult<UsuarioLogadoDto>> Me()
    {
        var usuario = await userManager.GetUserAsync(User);
        if (usuario is null)
        {
            return Unauthorized();
        }

        var papeis = await userManager.GetRolesAsync(usuario);
        var mecanico = servicoMecanico.Query(m => m.UsuarioGuid == usuario.Id)
            .Select(m => new { m.Id, m.Nome })
            .FirstOrDefault();
        var motoristaId = servicoMotorista.Query(m => m.UsuarioGuid == usuario.Id)
            .Select(m => (long?)m.Id)
            .FirstOrDefault();

        // Sem papel conhecido, cai no perfil mais restrito
        var perfil = papeis.Contains("Administrador") ? "gerente"
            : papeis.Contains(MecanicoController.PapelMecanico) ? "mecanico"
            : "motorista";

        return new UsuarioLogadoDto
        {
            Id = usuario.Id,
            Email = usuario.Email ?? usuario.UserName ?? "",
            Nome = mecanico?.Nome ?? usuario.UserName ?? "",
            Perfil = perfil,
            MecanicoId = mecanico?.Id,
            MotoristaId = motoristaId,
        };
    }
}

public class UsuarioLogadoDto
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string Nome { get; set; } = "";

    /// <summary>"gerente", "mecanico" ou "motorista"</summary>
    public string Perfil { get; set; } = "";

    public long? MecanicoId { get; set; }
    public long? MotoristaId { get; set; }
}
