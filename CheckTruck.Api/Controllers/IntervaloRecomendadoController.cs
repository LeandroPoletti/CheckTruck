using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntervaloRecomendadoController(ServicoCrud<IntervaloRecomendado> servicoCrud, ILogger<IntervaloRecomendado> logger)
    : CrudController<IntervaloRecomendado>(servicoCrud, "intervalo recomendado", logger)
{
    [HttpGet("{id:long}")]
    public IActionResult GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public IActionResult Post([FromBody] IntervaloRecomendado entidade) => PostCore(entidade);

    [HttpPut("{id:long}")]
    public IActionResult Put(long id, [FromBody] IntervaloRecomendado entidade) => PutCore(id, entidade);

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
