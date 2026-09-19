using CheckTruck.Api.Dtos.Tecnicos;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TecnicoController(ServicoCrud<Tecnico> servicoCrud, ILogger<Tecnico> logger)
    : CrudController<Tecnico, TecnicoResponseDto>(servicoCrud, "técnico", logger, t => t.ToResponseDto())
{
    [HttpGet]
    public ActionResult<IEnumerable<TecnicoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<TecnicoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<TecnicoResponseDto> Post([FromBody] TecnicoRequestDto dto) => PostCore(dto.ToEntity());

    [HttpPut("{id:long}")]
    public ActionResult<TecnicoResponseDto> Put(long id, [FromBody] TecnicoRequestDto dto) => PutCore(id, dto.ToEntity());

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
