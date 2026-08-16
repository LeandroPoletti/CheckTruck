using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeracaoModeloController(ServicoCrud<GeracaoModelo> servicoCrud, ILogger<GeracaoModelo> logger)
    : CrudController<GeracaoModelo>(servicoCrud, "geração de modelo", logger)
{
    [HttpGet("{id:long}")]
    public IActionResult GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public IActionResult Post([FromBody] GeracaoModelo entidade) => PostCore(entidade);

    [HttpPut("{id:long}")]
    public IActionResult Put(long id, [FromBody] GeracaoModelo entidade) => PutCore(id, entidade);

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
