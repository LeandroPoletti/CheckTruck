using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class PaisController(ServicoCrud<Pais> servicoCrud, ILogger<Pais> logger)
    : CrudController<Pais>(servicoCrud, "país", logger)
{
    [HttpGet("{id:long}")]
    public IActionResult GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public IActionResult Post([FromBody] Pais pais) => PostCore(pais);

    [HttpPut("{id:long}")]
    public IActionResult Put(long id, [FromBody] Pais pais) => PutCore(id, pais);

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
