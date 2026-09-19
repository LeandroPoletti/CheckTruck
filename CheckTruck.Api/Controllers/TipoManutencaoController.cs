using CheckTruck.Api.Dtos.TiposManutencao;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TipoManutencaoController(ServicoCrud<TipoManutencao> servicoCrud, ILogger<TipoManutencao> logger)
    : CrudController<TipoManutencao, TipoManutencaoResponseDto>(servicoCrud, "tipo de manutenção", logger, t => t.ToResponseDto())
{
    [HttpGet]
    public ActionResult<IEnumerable<TipoManutencaoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<TipoManutencaoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<TipoManutencaoResponseDto> Post([FromBody] TipoManutencaoRequestDto dto) => PostCore(dto.ToEntity());

    [HttpPut("{id:long}")]
    public ActionResult<TipoManutencaoResponseDto> Put(long id, [FromBody] TipoManutencaoRequestDto dto) => PutCore(id, dto.ToEntity());

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
