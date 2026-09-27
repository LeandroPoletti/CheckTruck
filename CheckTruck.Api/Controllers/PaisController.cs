using CheckTruck.Api.Dtos.Paises;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaisController(ServicoCrud<Pais> servicoCrud, ServicoCrud<Fabricante> servicoFabricante, ILogger<Pais> logger)
    : CrudController<Pais, PaisResponseDto>(servicoCrud, "país", logger, p => p.ToResponseDto())
{
    [HttpGet]
    public ActionResult<IEnumerable<PaisResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<PaisResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<PaisResponseDto> Post([FromBody] PaisRequestDto dto) => PostCore(dto.ToEntity());

    [HttpPut("{id:long}")]
    public ActionResult<PaisResponseDto> Put(long id, [FromBody] PaisRequestDto dto) => PutCore(id, dto.ToEntity());

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id)
    {
        var fabricantes = servicoFabricante.Query(f => f.PaisOrigem.Id == id).Count();
        if (fabricantes > 0)
        {
            return BadRequest($"Não é possível excluir: o país possui {fabricantes} fabricante(s) cadastrado(s).");
        }

        return DeleteCore(id);
    }
}
