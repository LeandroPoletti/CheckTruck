using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MotoristaController(ServicoCrud<Motorista> servicoCrud, ILogger<Motorista> logger)
    : CrudController<Motorista>(servicoCrud, "motorista", logger)
{
    [HttpGet("{id:long}")]
    public IActionResult GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public IActionResult Post([FromBody] Motorista entidade) => PostCore(entidade);

    [HttpPut("{id:long}")]
    public IActionResult Put(long id, [FromBody] Motorista entidade) => PutCore(id, entidade);

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
