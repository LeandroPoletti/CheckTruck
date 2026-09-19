using CheckTruck.Api.Dtos.GeracoesModelo;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeracaoModeloController(
    ServicoCrud<GeracaoModelo> servicoCrud,
    ServicoCrud<Fabricante> servicoFabricante,
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
    public IActionResult Delete(long id) => DeleteCore(id);
}
