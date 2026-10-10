using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Api.Dtos.Usuarios;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>Acessos ao sistema: quem entra, o cargo e o que cada um pode fazer.</summary>
[ApiController]
[Route("api/[controller]")]
public class UsuarioController(ServicoUsuario servicoUsuario) : CheckTruckController
{
    /// <summary>
    /// Quem está logado, com cargo, permissões e a empresa (nome e tipo de conta): o front monta o menu com isso.
    /// O dono do sistema vem sem empresa.
    /// </summary>
    [HttpGet("me")]
    [ExigePermissao]
    public ActionResult<UsuarioLogadoResponseDto> Me() => HttpContext.UsuarioLogado().ToLogadoResponseDto();

    /// <summary>Motoristas ativos, para escolher quem está com o caminhão.</summary>
    [HttpGet("motoristas")]
    [ExigePermissao]
    public ActionResult<IEnumerable<UsuarioResumoDto>> Motoristas() =>
        servicoUsuario.ListarMotoristasAtivos()
            .Select(u => new UsuarioResumoDto { Id = u.Id, Nome = u.Nome })
            .ToList();

    /// <summary>Todos os acessos, ativos e inativos.</summary>
    [HttpGet]
    [SomenteGestao]
    public ActionResult<IEnumerable<UsuarioResponseDto>> Get() =>
        servicoUsuario.Listar().AsEnumerable().Select(u => u.ToResponseDto()).ToList();

    [HttpGet("{id}")]
    [SomenteGestao]
    public async Task<ActionResult<UsuarioResponseDto>> GetById(string id)
    {
        var usuario = await servicoUsuario.ObterAsync(id);
        if (usuario is null)
        {
            return NotFound();
        }

        return usuario.ToResponseDto();
    }

    [HttpPost]
    [SomenteGestao]
    public async Task<ActionResult<UsuarioResponseDto>> Post([FromBody] UsuarioRequestDto dto)
    {
        var usuario = await servicoUsuario.CriarAsync(dto.ToEntity(), dto.Senha);
        if (usuario is null)
        {
            return Erro(servicoUsuario.Mensagens);
        }

        return CreatedAtAction(nameof(GetById), new { id = usuario.Id }, usuario.ToResponseDto());
    }

    /// <summary>Edita dados, cargo e permissões. Senha em branco mantém a atual.</summary>
    [HttpPut("{id}")]
    [SomenteGestao]
    public async Task<ActionResult<UsuarioResponseDto>> Put(string id, [FromBody] UsuarioRequestDto dto)
    {
        var usuario = await servicoUsuario.AtualizarAsync(id, dto.ToEntity(), dto.Senha, HttpContext.UsuarioLogado().Id);
        if (usuario is null)
        {
            return Erro(servicoUsuario.Mensagens);
        }

        return usuario.ToResponseDto();
    }

    /// <summary>Ativa ou desativa (corpo: true ou false). Inativo não entra no sistema.</summary>
    [HttpPut("{id}/ativo")]
    [SomenteGestao]
    public async Task<ActionResult<UsuarioResponseDto>> AlterarAtivo(string id, [FromBody] bool ativo)
    {
        var usuario = await servicoUsuario.AlterarAtivoAsync(id, ativo, HttpContext.UsuarioLogado().Id);
        if (usuario is null)
        {
            return Erro(servicoUsuario.Mensagens);
        }

        return usuario.ToResponseDto();
    }
}
