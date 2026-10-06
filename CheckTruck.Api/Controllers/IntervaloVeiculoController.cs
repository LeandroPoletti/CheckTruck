using CheckTruck.Api.Dtos.IntervalosVeiculo;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Intervalos próprios de um caminhão (ex.: plano da concessionária). Têm prioridade sobre o
/// intervalo do modelo e sobre o padrão seguro. Filtro útil: ?$filter=Veiculo/Id eq 5
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class IntervaloVeiculoController(
    ServicoCrud<IntervaloVeiculo> servicoCrud,
    ServicoCrud<Veiculo> servicoVeiculo,
    ServicoCrud<TipoManutencao> servicoTipoManutencao,
    ILogger<IntervaloVeiculo> logger)
    : CrudController<IntervaloVeiculo, IntervaloVeiculoResponseDto>(
        servicoCrud, "intervalo do veículo", logger,
        i => i.ToResponseDto(),
        q => q.Include(i => i.Veiculo).Include(i => i.TipoManutencao))
{
    [HttpGet]
    public ActionResult<IEnumerable<IntervaloVeiculoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<IntervaloVeiculoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<IntervaloVeiculoResponseDto> Post([FromBody] IntervaloVeiculoRequestDto dto)
    {
        var (veiculo, tipoManutencao, erro) = ResolverRelacionados(dto);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        var jaExiste = Servico
            .Query(i => i.Veiculo.Id == dto.VeiculoId && i.TipoManutencao.Id == dto.TipoManutencaoId)
            .Any();
        if (jaExiste)
        {
            return BadRequest("Esse caminhão já tem um intervalo próprio para esse item. Altere o existente.");
        }

        return PostCore(dto.ToEntity(veiculo!, tipoManutencao!));
    }

    [HttpPut("{id:long}")]
    public ActionResult<IntervaloVeiculoResponseDto> Put(long id, [FromBody] IntervaloVeiculoRequestDto dto)
    {
        var (veiculo, tipoManutencao, erro) = ResolverRelacionados(dto);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PutCore(id, dto.ToEntity(veiculo!, tipoManutencao!));
    }

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id) => DeleteCore(id);

    private (Veiculo? veiculo, TipoManutencao? tipoManutencao, string? erro) ResolverRelacionados(IntervaloVeiculoRequestDto dto)
    {
        var veiculo = servicoVeiculo.GetById(dto.VeiculoId);
        if (veiculo is null)
        {
            return (null, null, "Veículo não encontrado.");
        }

        var tipoManutencao = servicoTipoManutencao.GetById(dto.TipoManutencaoId);
        if (tipoManutencao is null)
        {
            return (null, null, "Tipo de manutenção não encontrado.");
        }

        return (veiculo, tipoManutencao, null);
    }
}
