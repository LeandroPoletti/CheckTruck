using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Chamados;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Chamados: quem está com o caminhão conta o problema e o mecânico vai ver. Só na conta Frota.
/// Abrir chamados: abrir, editar e excluir os próprios enquanto pendentes. Atender chamados: ver todos, atender e resolver.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[SomenteFrota]
[ExigeUmaDasPermissoes(Permissao.AbrirChamados | Permissao.AtenderChamados)]
public class ChamadoController(ServicoChamado servicoChamado) : CheckTruckController
{
    /// <summary>Pendentes e concluídos, do mais novo para o mais velho. Quem só abre vê os próprios.</summary>
    [HttpGet]
    public ActionResult<IEnumerable<ChamadoResponseDto>> Get() =>
        servicoChamado.Listar(HttpContext.UsuarioLogado()).Select(ChamadoDtoExtensions.Projecao).ToList();

    /// <summary>Caminhões ativos (id e placa), para escolher ao abrir o chamado.</summary>
    [HttpGet("veiculos")]
    [ExigePermissao(Permissao.AbrirChamados)]
    public ActionResult<IEnumerable<VeiculoResumoDto>> Veiculos() =>
        servicoChamado.ListarVeiculosAtivos()
            .Select(v => new VeiculoResumoDto { Id = v.Id, Placa = v.Placa })
            .ToList();

    /// <summary>Se quem abre tem cargo Motorista, ele vira o motorista atual do caminhão.</summary>
    [HttpPost]
    [ExigePermissao(Permissao.AbrirChamados)]
    public ActionResult<ChamadoResponseDto> Post([FromBody] AbrirChamadoRequestDto dto)
    {
        var chamado = servicoChamado.Abrir(HttpContext.UsuarioLogado(), dto.VeiculoId!.Value, dto.ToEntity());
        if (chamado is null)
        {
            return Erro(servicoChamado.Mensagens);
        }

        return Buscar(chamado.Id);
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.AbrirChamados)]
    public ActionResult<ChamadoResponseDto> Put(long id, [FromBody] ChamadoRequestDto dto)
    {
        if (servicoChamado.Editar(HttpContext.UsuarioLogado(), id, dto.ToEntity()) is null)
        {
            return Erro(servicoChamado.Mensagens);
        }

        return Buscar(id);
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.AbrirChamados)]
    public IActionResult Delete(long id)
    {
        if (!servicoChamado.Excluir(HttpContext.UsuarioLogado(), id))
        {
            return Erro(servicoChamado.Mensagens);
        }

        return NoContent();
    }

    /// <summary>Grava quem está cuidando do chamado. Ele continua pendente.</summary>
    [HttpPost("{id:long}/atender")]
    [ExigePermissao(Permissao.AtenderChamados)]
    public ActionResult<ChamadoResponseDto> Atender(long id)
    {
        if (servicoChamado.Atender(HttpContext.UsuarioLogado(), id) is null)
        {
            return Erro(servicoChamado.Mensagens);
        }

        return Buscar(id);
    }

    /// <summary>Conclui o chamado com o que foi feito.</summary>
    [HttpPost("{id:long}/resolver")]
    [ExigePermissao(Permissao.AtenderChamados)]
    public ActionResult<ChamadoResponseDto> Resolver(long id, [FromBody] ResolverChamadoRequestDto dto)
    {
        if (servicoChamado.Resolver(HttpContext.UsuarioLogado(), id, dto.Solucao) is null)
        {
            return Erro(servicoChamado.Mensagens);
        }

        return Buscar(id);
    }

    // O chamado como a lista mostra (com placa e nomes)
    private ChamadoResponseDto Buscar(long id) =>
        servicoChamado.Query(c => c.Id == id).Select(ChamadoDtoExtensions.Projecao).First();
}
