using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.GeracoesModelo;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

// Ler: basta estar logado (os formulários usam a lista). Criar, editar e apagar: Cadastros
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class GeracaoModeloController(
    ServicoCrud<GeracaoModelo> servicoCrud,
    ServicoCrud<Fabricante> servicoFabricante,
    ServicoCrud<Modelo> servicoModelo,
    ILogger<GeracaoModelo> logger)
    : CrudController<GeracaoModelo, GeracaoModeloResponseDto>(
        servicoCrud, "geração de modelo", logger,
        g => g.ToResponseDto(),
        q => q.Include(g => g.Fabricante))
{
    [HttpGet]
    public ActionResult<IEnumerable<GeracaoModeloResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<GeracaoModeloResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<GeracaoModeloResponseDto> Post([FromBody] GeracaoModeloRequestDto dto)
    {
        var fabricante = servicoFabricante.GetById(dto.FabricanteId);
        if (fabricante is null)
        {
            return BadRequest("Fabricante não encontrado.");
        }

        return PostCore(dto.ToEntity(fabricante));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<GeracaoModeloResponseDto> Put(long id, [FromBody] GeracaoModeloRequestDto dto)
    {
        var fabricante = servicoFabricante.GetById(dto.FabricanteId);
        if (fabricante is null)
        {
            return BadRequest("Fabricante não encontrado.");
        }

        return PutCore(id, dto.ToEntity(fabricante));
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public IActionResult Delete(long id)
    {
        var modelos = servicoModelo.Query(m => m.Geracao.Id == id).Count();
        if (modelos > 0)
        {
            return BadRequest($"Não é possível excluir: a geração possui {modelos} modelo(s) cadastrado(s).");
        }

        return DeleteCore(id);
    }
}
