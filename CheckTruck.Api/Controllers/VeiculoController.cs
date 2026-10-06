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
    ServicoSituacaoVeiculo servicoSituacao,
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

    /// <summary>
    /// Veículos com modelo, geração, motorista e situação de manutenção já calculada
    /// (status e item mais urgente), para as listas de veículos.
    /// </summary>
    /// <param name="apenasAtivos">true para ignorar veículos desativados.</param>
    [HttpGet("situacao")]
    public ActionResult<IEnumerable<VeiculoSituacaoResponseDto>> GetSituacao([FromQuery] bool apenasAtivos = false)
    {
        return servicoSituacao.ObterSituacaoVeiculos(apenasAtivos).Select(s => s.ToResponseDto()).ToList();
    }

    /// <summary>
    /// Situação completa de um caminhão pela placa: todos os itens, com o que já venceu e o que vai
    /// vencer (km e dias restantes). É a consulta do mecânico no pátio. Aceita placa com ou sem hífen.
    /// </summary>
    [HttpGet("placa/{placa}/situacao")]
    public ActionResult<VeiculoSituacaoResponseDto> GetSituacaoPorPlaca(string placa)
    {
        var situacao = servicoSituacao.ObterSituacaoPorPlaca(placa);
        if (situacao is null)
        {
            return NotFound("Nenhum caminhão encontrado com essa placa.");
        }

        return situacao.ToResponseDto(incluirItens: true);
    }

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

        Motorista? motorista = null;
        if (dto.MotoristaId.HasValue)
        {
            motorista = servicoMotorista.GetById(dto.MotoristaId.Value);
            if (motorista is null)
            {
                return BadRequest("Motorista não encontrado.");
            }
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

        Motorista? motorista = null;
        if (dto.MotoristaId.HasValue)
        {
            motorista = servicoMotorista.GetById(dto.MotoristaId.Value);
            if (motorista is null)
            {
                return BadRequest("Motorista não encontrado.");
            }
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
