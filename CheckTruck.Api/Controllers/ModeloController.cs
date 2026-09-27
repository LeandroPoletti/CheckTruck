using CheckTruck.Api.Dtos.Modelos;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModeloController(
    ServicoCrud<Modelo> servicoCrud,
    ServicoCrud<GeracaoModelo> servicoGeracaoModelo,
    ServicoCrud<Veiculo> servicoVeiculo,
    ServicoCrud<IntervaloRecomendado> servicoIntervalo,
    ILogger<Modelo> logger)
    : CrudController<Modelo, ModeloResponseDto>(
        servicoCrud, "modelo", logger,
        m => m.ToResponseDto(),
        q => q.Include(m => m.Geracao))
{
    [HttpGet]
    public ActionResult<IEnumerable<ModeloResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<ModeloResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<ModeloResponseDto> Post([FromBody] ModeloRequestDto dto)
    {
        var geracao = servicoGeracaoModelo.GetById(dto.GeracaoId);
        if (geracao is null)
        {
            return BadRequest("Geração de modelo não encontrada.");
        }

        return PostCore(dto.ToEntity(geracao));
    }

    [HttpPut("{id:long}")]
    public ActionResult<ModeloResponseDto> Put(long id, [FromBody] ModeloRequestDto dto)
    {
        var geracao = servicoGeracaoModelo.GetById(dto.GeracaoId);
        if (geracao is null)
        {
            return BadRequest("Geração de modelo não encontrada.");
        }

        return PutCore(id, dto.ToEntity(geracao));
    }

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id)
    {
        var veiculos = servicoVeiculo.Query(v => v.Modelo.Id == id).Count();
        var intervalos = servicoIntervalo.Query(i => i.Modelo.Id == id).Count();
        if (veiculos > 0 || intervalos > 0)
        {
            return BadRequest($"Não é possível excluir: o modelo possui {veiculos} veículo(s) e {intervalos} intervalo(s) recomendado(s) cadastrado(s).");
        }

        return DeleteCore(id);
    }
}
