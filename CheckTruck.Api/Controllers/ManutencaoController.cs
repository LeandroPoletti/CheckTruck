using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Manutencoes;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManutencaoController(
    ServicoManutencao servicoManutencao,
    ServicoCrud<Veiculo> servicoVeiculo,
    ServicoCrud<TipoManutencao> servicoTipoManutencao,
    ServicoCrud<Mecanico> servicoMecanico,
    ILogger<Manutencao> logger)
    : CrudController<Manutencao, ManutencaoResponseDto>(
        servicoManutencao, "manutenção", logger,
        m => m.ToResponseDto(),
        q => q.Include(m => m.Veiculo).Include(m => m.TipoManutencao).Include(m => m.Mecanico))
{
    [HttpGet]
    public ActionResult<IEnumerable<ManutencaoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<ManutencaoResponseDto> GetById(long id) => GetByIdCore(id);

    /// <summary>
    /// Lança uma ordem de serviço (permissão Ordem de serviço). O login de quem lançou e a data/hora
    /// ficam gravados (lancadoPor / lancadoEm). mecanicoId é quem fez a troca (cadastro de mecânicos).
    /// Se kmProximaTroca vier 0 ou dataProximaTroca vier null, o sistema calcula pelo intervalo
    /// do caminhão → modelo → padrão seguro. O kmAtual da OS atualiza o km do caminhão quando é maior.
    /// </summary>
    [HttpPost]
    [ExigePermissao(Permissao.OrdemServico)]
    public ActionResult<ManutencaoResponseDto> Post([FromBody] ManutencaoRequestDto dto)
    {
        var (veiculo, tipoManutencao, mecanico, erro) = ResolverRelacionados(dto, exigirAtivo: true);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        var entidade = dto.ToEntity(veiculo!, tipoManutencao!, mecanico!);
        entidade.LancadoPor = UsuarioLogado();
        entidade.CriadoEm = DateTime.UtcNow;

        return PostCore(entidade);
    }

    /// <summary>
    /// Corrige uma OS já lançada. Quem lançou e quando continuam os originais; a hora da
    /// correção fica em atualizadoEm.
    /// </summary>
    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.OrdemServico)]
    public ActionResult<ManutencaoResponseDto> Put(long id, [FromBody] ManutencaoRequestDto dto)
    {
        var original = Servico.Query(m => m.Id == id)
            .Select(m => new { m.LancadoPor, m.CriadoEm })
            .FirstOrDefault();
        if (original is null)
        {
            return NotFound();
        }

        // Na correção aceita mecânico inativo: a OS pode ser antiga
        var (veiculo, tipoManutencao, mecanico, erro) = ResolverRelacionados(dto, exigirAtivo: false);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        var entidade = dto.ToEntity(veiculo!, tipoManutencao!, mecanico!);
        entidade.LancadoPor = original.LancadoPor;
        entidade.CriadoEm = original.CriadoEm;
        entidade.AtualizadoEm = DateTime.UtcNow;

        return PutCore(id, entidade);
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.OrdemServico)]
    public IActionResult Delete(long id) => DeleteCore(id);

    // Login (UserName) de quem está autenticado pelo token do Identity
    private string UsuarioLogado() => User.Identity?.Name ?? "desconhecido";

    private (Veiculo? veiculo, TipoManutencao? tipoManutencao, Mecanico? mecanico, string? erro) ResolverRelacionados(
        ManutencaoRequestDto dto, bool exigirAtivo)
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

        var mecanico = servicoMecanico.GetById(dto.MecanicoId);
        if (mecanico is null)
        {
            return (null, null, null, "Mecânico não encontrado.");
        }

        if (exigirAtivo && !mecanico.Ativo)
        {
            return (null, null, null, "Esse mecânico está inativo. Ative o cadastro ou escolha outro.");
        }

        return (veiculo, tipoManutencao, mecanico, null);
    }
}
