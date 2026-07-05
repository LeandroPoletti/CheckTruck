using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModeloController(ServicoCrud<Modelo> servicoCrud)
    : CrudController<Modelo>(servicoCrud, "modelo")
{
    [HttpGet("{id:long}")]
    public IActionResult GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public IActionResult Post([FromBody] Modelo entidade) => PostCore(entidade);

    [HttpPut("{id:long}")]
    public IActionResult Put(long id, [FromBody] Modelo entidade) => PutCore(id, entidade);

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
