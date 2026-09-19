using CheckTruck.Api.Dtos.IntervalosRecomendados;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntervaloRecomendadoController(
    ServicoCrud<IntervaloRecomendado> servicoCrud,
    ServicoCrud<Modelo> servicoModelo,
    ServicoCrud<TipoManutencao> servicoTipoManutencao,
    ILogger<IntervaloRecomendado> logger)
    : CrudController<IntervaloRecomendado, IntervaloRecomendadoResponseDto>(
        servicoCrud, "intervalo recomendado", logger,
        i => i.ToResponseDto(),
        q => q.Include(i => i.Modelo).Include(i => i.TipoManutencao))
{
    [HttpGet]
    public ActionResult<IEnumerable<IntervaloRecomendadoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<IntervaloRecomendadoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<IntervaloRecomendadoResponseDto> Post([FromBody] IntervaloRecomendadoRequestDto dto)
    {
        var modelo = servicoModelo.GetById(dto.ModeloId);
        if (modelo is null)
        {
            return BadRequest("Modelo não encontrado.");
        }

        var tipoManutencao = servicoTipoManutencao.GetById(dto.TipoManutencaoId);
        if (tipoManutencao is null)
        {
            return BadRequest("Tipo de manutenção não encontrado.");
        }

        return PostCore(dto.ToEntity(modelo, tipoManutencao));
    }

    [HttpPut("{id:long}")]
    public ActionResult<IntervaloRecomendadoResponseDto> Put(long id, [FromBody] IntervaloRecomendadoRequestDto dto)
    {
        var modelo = servicoModelo.GetById(dto.ModeloId);
        if (modelo is null)
        {
            return BadRequest("Modelo não encontrado.");
        }

        var tipoManutencao = servicoTipoManutencao.GetById(dto.TipoManutencaoId);
        if (tipoManutencao is null)
        {
            return BadRequest("Tipo de manutenção não encontrado.");
        }

        return PutCore(id, dto.ToEntity(modelo, tipoManutencao));
    }

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);
}
