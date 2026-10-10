using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Manutencoes;
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
public class ManutencaoController(
    ServicoManutencao servicoManutencao,
    ServicoCrud<Veiculo> servicoVeiculo,
    ServicoCrud<TipoManutencao> servicoTipoManutencao,
    ServicoCrud<Mecanico> servicoMecanico,
    ServicoUsuario servicoUsuario,
    ILogger<Manutencao> logger)
    : CrudController<Manutencao, ManutencaoResponseDto>(
        servicoManutencao, "manutenção", logger,
        m => m.ToResponseDto(),
        q => q.Include(m => m.Veiculo).Include(m => m.TipoManutencao).Include(m => m.Mecanico)
            .Include(m => m.Motorista).Include(m => m.LancadoPor))
{
    // O que a OS aponta, já conferido
    private record Relacionados(Veiculo Veiculo, TipoManutencao TipoManutencao, Mecanico Mecanico, Usuario? Motorista);

    [HttpGet]
    public ActionResult<IEnumerable<ManutencaoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<ManutencaoResponseDto> GetById(long id) => GetByIdCore(id);

    /// <summary>
    /// Lança uma ordem de serviço (permissão Ordem de serviço). O número da OS é o id, gerado em sequência.
    /// Quem lançou e a data/hora ficam gravados (lancadoPor / lancadoEm). mecanicoId é quem fez a troca
    /// (cadastro de mecânicos). motoristaId é opcional: quando vem, vira o motorista atual do caminhão.
    /// Se kmProximaTroca vier 0 ou dataProximaTroca vier null, o sistema calcula pelo intervalo
    /// do caminhão → geração → padrão seguro. O kmAtual da OS atualiza o km do caminhão quando é maior.
    /// </summary>
    [HttpPost]
    [ExigePermissao(Permissao.OrdemServico)]
    public async Task<ActionResult<ManutencaoResponseDto>> Post([FromBody] ManutencaoRequestDto dto)
    {
        var (relacionados, erro) = await ResolverRelacionadosAsync(dto);
        if (relacionados is null)
        {
            return Erro(erro!);
        }

        return PostCore(dto.ToEntity(relacionados.Veiculo, relacionados.TipoManutencao, relacionados.Mecanico, relacionados.Motorista));
    }

    /// <summary>
    /// Corrige uma OS já lançada. Quem lançou e quando continuam os originais; a hora da
    /// correção fica em atualizadoEm. O motorista do caminhão não muda.
    /// </summary>
    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.OrdemServico)]
    public async Task<ActionResult<ManutencaoResponseDto>> Put(long id, [FromBody] ManutencaoRequestDto dto)
    {
        var (relacionados, erro) = await ResolverRelacionadosAsync(dto);
        if (relacionados is null)
        {
            return Erro(erro!);
        }

        return PutCore(id, dto.ToEntity(relacionados.Veiculo, relacionados.TipoManutencao, relacionados.Mecanico, relacionados.Motorista));
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.OrdemServico)]
    public IActionResult Delete(long id) => DeleteCore(id);

    // Acha pelo id o que a OS aponta. Se o mecânico e o motorista precisam estar ativos, quem decide é o serviço
    private async Task<(Relacionados? relacionados, string? erro)> ResolverRelacionadosAsync(ManutencaoRequestDto dto)
    {
        var veiculo = servicoVeiculo.GetById(dto.VeiculoId);
        if (veiculo is null)
        {
            return (null, "Veículo não encontrado.");
        }

        var tipoManutencao = servicoTipoManutencao.GetById(dto.TipoManutencaoId);
        if (tipoManutencao is null)
        {
            return (null, "Tipo de manutenção não encontrado.");
        }

        var mecanico = servicoMecanico.GetById(dto.MecanicoId);
        if (mecanico is null)
        {
            return (null, "Mecânico não encontrado.");
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

        return (new Relacionados(veiculo, tipoManutencao, mecanico, motorista), null);
    }
}
