using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.IntervalosRecomendados;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

// Intervalos recomendados de cada geração (ex.: manual do fabricante). Filtro útil: ?$filter=Geracao/Id eq 4
// Ler: basta estar logado (a situação dos caminhões usa os intervalos). Criar, editar e apagar: Intervalos
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class IntervaloRecomendadoController(
    ServicoCrud<IntervaloRecomendado> servicoCrud,
    ServicoCrud<Geracao> servicoGeracao,
    ServicoCrud<TipoManutencao> servicoTipoManutencao,
    ServicoSituacaoVeiculo servicoSituacao,
    ILogger<IntervaloRecomendado> logger)
    : CrudController<IntervaloRecomendado, IntervaloRecomendadoResponseDto>(
        servicoCrud, "intervalo recomendado", logger,
        i => i.ToResponseDto(),
        q => q.Include(i => i.Geracao).Include(i => i.TipoManutencao))
{
    [HttpGet]
    public ActionResult<IEnumerable<IntervaloRecomendadoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<IntervaloRecomendadoResponseDto> GetById(long id) => GetByIdCore(id);

    /// <summary>
    /// Padrão seguro do sistema para os caminhões desta geração, por tipo de manutenção. Vale quando
    /// nem o caminhão nem a geração têm intervalo. Tipo sem padrão (ex.: embreagem) não vem na lista.
    /// </summary>
    [HttpGet("padrao/{geracaoId:long}")]
    public ActionResult<IEnumerable<IntervaloPadraoResponseDto>> GetPadrao(long geracaoId)
    {
        var padrao = servicoSituacao.ObterPadraoDaGeracao(geracaoId);
        if (padrao is null)
        {
            return NotFound("Geração não encontrada.");
        }

        return padrao
            .Select(p => new IntervaloPadraoResponseDto
            {
                TipoManutencaoId = p.Key,
                IntervaloKm = p.Value.IntervaloKm,
                IntervaloMeses = p.Value.IntervaloMeses
            })
            .ToList();
    }

    [HttpPost]
    [ExigePermissao(Permissao.Intervalos)]
    public ActionResult<IntervaloRecomendadoResponseDto> Post([FromBody] IntervaloRecomendadoRequestDto dto)
    {
        var (geracao, tipoManutencao, erro) = ResolverRelacionados(dto, idIgnorar: null);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PostCore(dto.ToEntity(geracao!, tipoManutencao!));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Intervalos)]
    public ActionResult<IntervaloRecomendadoResponseDto> Put(long id, [FromBody] IntervaloRecomendadoRequestDto dto)
    {
        var (geracao, tipoManutencao, erro) = ResolverRelacionados(dto, idIgnorar: id);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PutCore(id, dto.ToEntity(geracao!, tipoManutencao!));
    }

    /// <summary>Sem o intervalo da geração, os caminhões voltam ao intervalo próprio (se tiverem) ou ao padrão do sistema.</summary>
    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Intervalos)]
    public IActionResult Delete(long id) => DeleteCore(id);

    // Geração e tipo existem, e a geração ainda não tem intervalo para esse tipo (um por geração e tipo)
    private (Geracao? geracao, TipoManutencao? tipoManutencao, string? erro) ResolverRelacionados(
        IntervaloRecomendadoRequestDto dto, long? idIgnorar)
    {
        var geracao = servicoGeracao.GetById(dto.GeracaoId);
        if (geracao is null)
        {
            return (null, null, "Geração não encontrada.");
        }

        var tipoManutencao = servicoTipoManutencao.GetById(dto.TipoManutencaoId);
        if (tipoManutencao is null)
        {
            return (null, null, "Tipo de manutenção não encontrado.");
        }

        var jaExiste = Servico
            .Query(i => i.Id != idIgnorar && i.Geracao.Id == dto.GeracaoId && i.TipoManutencao.Id == dto.TipoManutencaoId)
            .Any();
        if (jaExiste)
        {
            return (null, null, "Essa geração já tem intervalo para esse item. Altere o existente.");
        }

        return (geracao, tipoManutencao, null);
    }
}
