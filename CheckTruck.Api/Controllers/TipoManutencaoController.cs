using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TipoManutencaoController(ServicoCrud<TipoManutencao> servicoCrud, ILogger<TipoManutencao> logger)
    : CrudController<TipoManutencao>(servicoCrud, "tipo de manutenção", logger)
{
    [HttpGet("{id:long}")]
    public IActionResult GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public IActionResult Post([FromBody] TipoManutencao entidade) => PostCore(entidade);

    [HttpPut("{id:long}")]
    public IActionResult Put(long id, [FromBody] TipoManutencao entidade) => PutCore(id, entidade);

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
