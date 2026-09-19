using CheckTruck.Api.Dtos.Motoristas;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MotoristaController(ServicoCrud<Motorista> servicoCrud, ILogger<Motorista> logger)
    : CrudController<Motorista, MotoristaResponseDto>(
        servicoCrud, "motorista", logger,
        m => m.ToResponseDto(),
        q => q.Include(m => m.Veiculo))
{
    [HttpGet]
    public ActionResult<IEnumerable<MotoristaResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<MotoristaResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<MotoristaResponseDto> Post([FromBody] MotoristaRequestDto dto) => PostCore(dto.ToEntity());

    [HttpPut("{id:long}")]
    public ActionResult<MotoristaResponseDto> Put(long id, [FromBody] MotoristaRequestDto dto) => PutCore(id, dto.ToEntity());

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
