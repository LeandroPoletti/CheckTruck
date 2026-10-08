using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.IntervalosRecomendados;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

// Ler: basta estar logado (a situação dos caminhões usa os intervalos). Criar, editar e apagar: Intervalos
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
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
    [ExigePermissao(Permissao.Intervalos)]
    public ActionResult<IntervaloRecomendadoResponseDto> Post([FromBody] IntervaloRecomendadoRequestDto dto)
    {
        var (modelo, tipoManutencao, erro) = ResolverRelacionados(dto, idIgnorar: null);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PostCore(dto.ToEntity(modelo!, tipoManutencao!));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Intervalos)]
    public ActionResult<IntervaloRecomendadoResponseDto> Put(long id, [FromBody] IntervaloRecomendadoRequestDto dto)
    {
        var (modelo, tipoManutencao, erro) = ResolverRelacionados(dto, idIgnorar: id);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PutCore(id, dto.ToEntity(modelo!, tipoManutencao!));
    }

    /// <summary>Sem o intervalo do modelo, os caminhões voltam ao intervalo próprio (se tiverem) ou ao padrão do sistema.</summary>
    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Intervalos)]
    public IActionResult Delete(long id) => DeleteCore(id);

    // Modelo e tipo existem, e o modelo ainda não tem intervalo para esse tipo (um por modelo e tipo)
    private (Modelo? modelo, TipoManutencao? tipoManutencao, string? erro) ResolverRelacionados(
        IntervaloRecomendadoRequestDto dto, long? idIgnorar)
    {
        var modelo = servicoModelo.GetById(dto.ModeloId);
        if (modelo is null)
        {
            return (null, null, "Modelo não encontrado.");
        }

        var tipoManutencao = servicoTipoManutencao.GetById(dto.TipoManutencaoId);
        if (tipoManutencao is null)
        {
            return (null, null, "Tipo de manutenção não encontrado.");
        }

        var jaExiste = Servico
            .Query(i => i.Id != idIgnorar && i.Modelo.Id == dto.ModeloId && i.TipoManutencao.Id == dto.TipoManutencaoId)
            .Any();
        if (jaExiste)
        {
            return (null, null, "Esse modelo já tem intervalo para esse item. Altere o existente.");
        }

        return (modelo, tipoManutencao, null);
    }
}
