using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Api.Dtos.OrdensServico;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

// Ver o histórico: Ver frota. Lançar, corrigir e apagar OS: Ordem de serviço
[ApiController]
[Route("api/[controller]")]
[ExigePermissao(Permissao.VerFrota)]
public class OrdemServicoController(
    ServicoOrdemServico servicoOrdemServico,
    ServicoCrud<Veiculo> servicoVeiculo,
    ServicoCrud<TipoManutencao> servicoTipoManutencao,
    ServicoCrud<Mecanico> servicoMecanico,
    ServicoUsuario servicoUsuario,
    ILogger<OrdemServico> logger)
    : CrudController<OrdemServico, OrdemServicoResponseDto>(
        servicoOrdemServico, "ordem de serviço", logger, o => o.ToResponseDto(), Completa)
{
    // O que a OS aponta, já conferido
    private record Relacionados(
        Veiculo Veiculo, IReadOnlyDictionary<long, TipoManutencao> Tipos, IList<Mecanico> Mecanicos, Usuario? Motorista);

    // A OS com tudo o que aparece na resposta (e que a correção precisa para trocar itens e mecânicos).
    // Itens e mecânicos vêm em consultas separadas, para não multiplicar as linhas da OS.
    private static IQueryable<OrdemServico> Completa(IQueryable<OrdemServico> query) =>
        query.Include(o => o.Veiculo)
            .Include(o => o.Itens).ThenInclude(i => i.TipoManutencao)
            .Include(o => o.Mecanicos)
            .Include(o => o.Motorista)
            .Include(o => o.LancadoPor)
            .AsSplitQuery();

    [HttpGet]
    public ActionResult<IEnumerable<OrdemServicoResponseDto>> Get() => GetODataCore();

    /// <summary>
    /// OS da frota (tela de OS do site e do app), da troca mais nova para a mais velha: as primeiras (quantos) e o
    /// total. Filtros: tipoId, busca (placa ou nº da OS), de e ate (aaaa-mm-dd, os dois dias entram).
    /// </summary>
    [HttpGet("pagina")]
    public ActionResult<PaginaDto<OrdemServicoResponseDto>> GetPagina([FromQuery] FiltroDasOrdensDto filtro) =>
        Completa(servicoOrdemServico.Filtrar(filtro.TipoId, filtro.Busca, filtro.De, filtro.Ate))
            .Pagina(filtro.Quantos, ordens => ordens.AsEnumerable().Select(o => o.ToResponseDto()));

    [HttpGet("{id:long}")]
    public ActionResult<OrdemServicoResponseDto> GetById(long id) => GetByIdCore(id);

    /// <summary>
    /// Lança uma ordem de serviço (permissão Ordem de serviço). O número segue a sequência da empresa (1, 2, 3...).
    /// itens: o que foi trocado (um por tipo de manutenção). mecanicoIds: quem fez (pelo menos um).
    /// Quem lançou e a data/hora ficam gravados (lancadoPor / lancadoEm). motoristaId é opcional: quando vem,
    /// vira o motorista atual do caminhão. Se o kmProximaTroca de um item vier 0 ou a dataProximaTroca vier null,
    /// o sistema calcula pelo intervalo do caminhão → empresa → fábrica → padrão. O kmAtual da OS atualiza o km
    /// do caminhão quando é maior.
    /// </summary>
    [HttpPost]
    [ExigePermissao(Permissao.OrdemServico)]
    public async Task<ActionResult<OrdemServicoResponseDto>> Post([FromBody] OrdemServicoRequestDto dto)
    {
        var (relacionados, erro) = await ResolverRelacionadosAsync(dto);
        if (relacionados is null)
        {
            return Erro(erro!);
        }

        return PostCore(dto.ToEntity(relacionados.Veiculo, relacionados.Tipos, relacionados.Mecanicos, relacionados.Motorista));
    }

    /// <summary>
    /// Corrige uma OS já lançada: os itens e os mecânicos ficam os que vierem. Quem lançou e quando continuam
    /// os originais; a hora da correção fica em atualizadoEm. O motorista do caminhão não muda.
    /// </summary>
    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.OrdemServico)]
    public async Task<ActionResult<OrdemServicoResponseDto>> Put(long id, [FromBody] OrdemServicoRequestDto dto)
    {
        var (relacionados, erro) = await ResolverRelacionadosAsync(dto);
        if (relacionados is null)
        {
            return Erro(erro!);
        }

        // A OS gravada, com os itens e os mecânicos: a correção troca neles o que mudou
        var ordemServico = Servico.GetById(id, Completa);
        if (ordemServico is null)
        {
            return NotFound();
        }

        ordemServico.Veiculo = relacionados.Veiculo;
        dto.AplicarEm(ordemServico, relacionados.Tipos, relacionados.Mecanicos, relacionados.Motorista);
        return PutCore(id, ordemServico);
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.OrdemServico)]
    public IActionResult Delete(long id) => DeleteCore(id);

    // Acha pelo id o que a OS aponta. Se os mecânicos e o motorista precisam estar ativos, quem decide é o serviço
    private async Task<(Relacionados? relacionados, string? erro)> ResolverRelacionadosAsync(OrdemServicoRequestDto dto)
    {
        var veiculo = servicoVeiculo.GetById(dto.VeiculoId);
        if (veiculo is null)
        {
            return (null, "Veículo não encontrado.");
        }

        var tipoIds = dto.Itens.Select(i => i.TipoManutencaoId).ToList();
        if (tipoIds.Distinct().Count() != tipoIds.Count)
        {
            return (null, "Cada item entra uma vez só na OS.");
        }

        var tipos = new Dictionary<long, TipoManutencao>();
        foreach (var tipoId in tipoIds)
        {
            var tipo = servicoTipoManutencao.GetById(tipoId);
            if (tipo is null)
            {
                return (null, "Tipo de manutenção não encontrado.");
            }

            tipos[tipoId] = tipo;
        }

        var mecanicos = new List<Mecanico>();
        foreach (var mecanicoId in dto.MecanicoIds.Distinct())
        {
            var mecanico = servicoMecanico.GetById(mecanicoId);
            if (mecanico is null)
            {
                return (null, "Mecânico não encontrado.");
            }

            mecanicos.Add(mecanico);
        }

        Usuario? motorista = null;
        if (!string.IsNullOrEmpty(dto.MotoristaId))
        {
            motorista = await servicoUsuario.ObterAsync(dto.MotoristaId);
            if (motorista is null)
            {
                return (null, "Motorista não encontrado.");
            }
        }

        return (new Relacionados(veiculo, tipos, mecanicos, motorista), null);
    }
}
