using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.IntervalosRecomendados;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

// Intervalos de cada geração. Filtro útil: ?$filter=Geracao/Id eq 4
// O de fábrica (do sistema, ex.: manual do fabricante) só o dono do sistema muda. A empresa pode ter o dela
// para a mesma geração e item, que vale antes do de fábrica (doSistema diz qual é qual).
// Ler: basta estar logado (a situação dos caminhões usa os intervalos). Criar, editar e apagar: Intervalos
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class IntervaloRecomendadoController(
    ServicoIntervaloRecomendado servicoIntervalo,
    ServicoCrud<Geracao> servicoGeracao,
    ServicoCrud<TipoManutencao> servicoTipoManutencao,
    ServicoSituacaoVeiculo servicoSituacao,
    ILogger<IntervaloRecomendado> logger)
    : CrudController<IntervaloRecomendado, IntervaloRecomendadoResponseDto>(
        servicoIntervalo, "intervalo recomendado", logger,
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
            return Erro("Geração não encontrada.", StatusCodes.Status404NotFound);
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
        var (geracao, tipoManutencao, erro) = ResolverRelacionados(dto);
        if (erro is not null)
        {
            return Erro(erro);
        }

        return PostCore(dto.ToEntity(geracao!, tipoManutencao!));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Intervalos)]
    public ActionResult<IntervaloRecomendadoResponseDto> Put(long id, [FromBody] IntervaloRecomendadoRequestDto dto)
    {
        var (geracao, tipoManutencao, erro) = ResolverRelacionados(dto);
        if (erro is not null)
        {
            return Erro(erro);
        }

        return PutCore(id, dto.ToEntity(geracao!, tipoManutencao!));
    }

    /// <summary>Sem esse intervalo, os caminhões da geração voltam ao próximo da fila (empresa → fábrica → padrão do sistema).</summary>
    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Intervalos)]
    public IActionResult Delete(long id) => DeleteCore(id);

    private (Geracao? geracao, TipoManutencao? tipoManutencao, string? erro) ResolverRelacionados(IntervaloRecomendadoRequestDto dto)
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

        return (geracao, tipoManutencao, null);
    }
}
