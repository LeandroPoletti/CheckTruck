using CheckTruck.Api.Dtos.Manutencoes;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManutencaoController(
    ServicoCrud<Manutencao> servicoCrud,
    ServicoCrud<Veiculo> servicoVeiculo,
    ServicoCrud<TipoManutencao> servicoTipoManutencao,
    ServicoCrud<Tecnico> servicoTecnico,
    ILogger<Manutencao> logger)
    : CrudController<Manutencao, ManutencaoResponseDto>(
        servicoCrud, "manutenção", logger,
        m => m.ToResponseDto(),
        q => q.Include(m => m.Veiculo).Include(m => m.TipoManutencao).Include(m => m.Tecnico))
{
    [HttpGet]
    public ActionResult<IEnumerable<ManutencaoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<ManutencaoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<ManutencaoResponseDto> Post([FromBody] ManutencaoRequestDto dto)
    {
        var (veiculo, tipoManutencao, tecnico, erro) = ResolverRelacionados(dto);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PostCore(dto.ToEntity(veiculo!, tipoManutencao!, tecnico!));
    }

    [HttpPut("{id:long}")]
    public ActionResult<ManutencaoResponseDto> Put(long id, [FromBody] ManutencaoRequestDto dto)
    {
        var (veiculo, tipoManutencao, tecnico, erro) = ResolverRelacionados(dto);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PutCore(id, dto.ToEntity(veiculo!, tipoManutencao!, tecnico!));
    }

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);

    private (Veiculo? veiculo, TipoManutencao? tipoManutencao, Tecnico? tecnico, string? erro) ResolverRelacionados(ManutencaoRequestDto dto)
    {
        var veiculo = servicoVeiculo.GetById(dto.VeiculoId);
        if (veiculo is null)
        {
            return (null, null, null, "Veículo não encontrado.");
        }

        var tipoManutencao = servicoTipoManutencao.GetById(dto.TipoManutencaoId);
        if (tipoManutencao is null)
        {
            return (null, null, null, "Tipo de manutenção não encontrado.");
        }

        var tecnico = servicoTecnico.GetById(dto.TecnicoId);
        if (tecnico is null)
        {
            return (null, null, null, "Técnico não encontrado.");
        }

        return (veiculo, tipoManutencao, tecnico, null);
    }
}
