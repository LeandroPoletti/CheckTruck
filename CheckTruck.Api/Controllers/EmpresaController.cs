using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Empresas;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Empresas (clientes do CheckTruck). O dono do sistema cadastra cada uma com o Admin dela, desativa, ativa de novo
/// e define uma senha nova para o Admin. Admin e Gestor veem a própria empresa (tela Minha empresa).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmpresaController(ServicoEmpresa servicoEmpresa, ServicoUsuario servicoUsuario) : CheckTruckController
{
    /// <summary>Todas as empresas, ativas e desativadas, com os Admins de cada uma.</summary>
    [HttpGet]
    [SomenteDonoDoSistema]
    public ActionResult<IEnumerable<EmpresaDoSistemaResponseDto>> Get()
    {
        var admins = servicoUsuario.ListarAdminsDasEmpresas().AsEnumerable().ToLookup(u => u.EmpresaId!.Value);
        return servicoEmpresa.Listar().AsEnumerable().Select(e => e.ToDoSistemaResponseDto(admins[e.Id])).ToList();
    }

    /// <summary>Cadastra a empresa e o Admin dela. O dono do sistema passa o e-mail e a senha para o dono da empresa.</summary>
    [HttpPost]
    [SomenteDonoDoSistema]
    public async Task<ActionResult<EmpresaDoSistemaResponseDto>> Post([FromBody] NovaEmpresaRequestDto dto)
    {
        var admin = await servicoEmpresa.CriarAsync(dto.NomeEmpresa, dto.Cnpj, dto.Nome, dto.Cpf, dto.Email, dto.Senha);
        if (admin is null)
        {
            return Erro(servicoEmpresa.Mensagens);
        }

        return StatusCode(StatusCodes.Status201Created, admin.Empresa!.ToDoSistemaResponseDto([admin]));
    }

    /// <summary>Ativa ou desativa (corpo: true ou false). Desativada, ninguém da empresa entra; os dados ficam guardados.</summary>
    [HttpPut("{id:long}/ativa")]
    [SomenteDonoDoSistema]
    public ActionResult AlterarAtiva(long id, [FromBody] bool ativa)
    {
        if (servicoEmpresa.AlterarAtiva(id, ativa) is null)
        {
            return Erro(servicoEmpresa.Mensagens);
        }

        return NoContent();
    }

    /// <summary>Senha nova para o Admin da empresa (quando ele esquece a dele). Os logins abertos dele acabam.</summary>
    [HttpPut("{id:long}/admins/{usuarioId}/senha")]
    [SomenteDonoDoSistema]
    public async Task<ActionResult> DefinirSenhaDoAdmin(long id, string usuarioId, [FromBody] NovaSenhaRequestDto dto)
    {
        if (!await servicoUsuario.DefinirSenhaDoAdminAsync(id, usuarioId, dto.Senha))
        {
            return Erro(servicoUsuario.Mensagens);
        }

        return NoContent();
    }

    [HttpGet("minha")]
    [SomenteGestao]
    public ActionResult<EmpresaResponseDto> Minha()
    {
        var empresa = servicoEmpresa.ObterAtual();
        if (empresa is null)
        {
            return NotFound();
        }

        return empresa.ToResponseDto();
    }
}
