using CheckTruck.Api.Dtos.Veiculos;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VeiculoController(
    ServicoVeiculo servicoVeiculo,
    ServicoCrud<Modelo> servicoModelo,
    ServicoCrud<Motorista> servicoMotorista,
    ILogger<Veiculo> logger)
    : CrudController<Veiculo, VeiculoResponseDto>(
        servicoVeiculo, "veículo", logger,
        v => v.ToResponseDto(),
        q => q.Include(v => v.Modelo).Include(v => v.Motorista))
{
    [HttpGet]
    public ActionResult<IEnumerable<VeiculoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<VeiculoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<VeiculoResponseDto> Post([FromBody] VeiculoRequestDto dto)
    {
        var modelo = servicoModelo.GetById(dto.ModeloId);
        if (modelo is null)
        {
            return BadRequest("Modelo não encontrado.");
        }

        var motorista = servicoMotorista.GetById(dto.MotoristaId);
        if (motorista is null)
        {
            return BadRequest("Motorista não encontrado.");
        }

        return PostCore(dto.ToEntity(modelo, motorista));
    }

    [HttpPut("{id:long}")]
    public ActionResult<VeiculoResponseDto> Put(long id, [FromBody] VeiculoRequestDto dto)
    {
        var modelo = servicoModelo.GetById(dto.ModeloId);
        if (modelo is null)
        {
            return BadRequest("Modelo não encontrado.");
        }

        var motorista = servicoMotorista.GetById(dto.MotoristaId);
        if (motorista is null)
        {
            return BadRequest("Motorista não encontrado.");
        }

        return PutCore(id, dto.ToEntity(modelo, motorista));
    }

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);

    [HttpPut("{id:long}/kilometragem")]
    public IActionResult AtualizarKilometragem(long id, [FromBody] int distancia)
    {
        var res = servicoVeiculo.AtualizarKmVeiculo(id, distancia);
        return res ? Ok() : BadRequest(servicoVeiculo.Mensagens);
    }
}
