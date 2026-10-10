using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Veiculos;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

// Ver: Ver frota. Criar e editar: Veículos. Somar km: Atualizar km.
// Caminhão não é excluído (as OS e o histórico de km dependem dele): quem não usa mais, desativa.
[ApiController]
[Route("api/[controller]")]
[ExigePermissao(Permissao.VerFrota)]
public class VeiculoController(
    ServicoVeiculo servicoVeiculo,
    ServicoSituacaoVeiculo servicoSituacao,
    ServicoCrud<Potencia> servicoPotencia,
    ServicoCrud<RegistroKm> servicoRegistroKm,
    ServicoUsuario servicoUsuario,
    ILogger<Veiculo> logger)
    : CrudController<Veiculo, VeiculoResponseDto>(
        servicoVeiculo, "veículo", logger,
        v => v.ToResponseDto(),
        q => q.Include(v => v.Potencia).ThenInclude(p => p.Geracao).ThenInclude(g => g.Modelo).ThenInclude(m => m.Fabricante)
            .Include(v => v.MotoristaAtual))
{
    [HttpGet]
    public ActionResult<IEnumerable<VeiculoResponseDto>> Get() => GetODataCore();

    /// <summary>
    /// Veículos com fabricante, modelo, geração, potência, motorista e situação de manutenção já calculada
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

    /// <summary>
    /// Situação completa de um caminhão: todos os itens, com km e dias restantes e de onde veio
    /// o intervalo (caminhão, geração ou padrão). É o que a tela de detalhe mostra.
    /// </summary>
    [HttpGet("{id:long}/situacao")]
    public ActionResult<VeiculoSituacaoResponseDto> GetSituacaoPorId(long id)
    {
        var situacao = servicoSituacao.ObterSituacao(id);
        if (situacao is null)
        {
            return NotFound();
        }

        return situacao.ToResponseDto(incluirItens: true);
    }

    [HttpPost]
    [ExigePermissao(Permissao.Veiculos)]
    public async Task<ActionResult<VeiculoResponseDto>> Post([FromBody] VeiculoRequestDto dto)
    {
        var potencia = servicoPotencia.GetById(dto.PotenciaId);
        if (potencia is null)
        {
            return BadRequest("Potência não encontrada.");
        }

        var (motorista, erro) = await ResolverMotoristaAsync(dto.MotoristaAtualId);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PostCore(dto.ToEntity(potencia, motorista));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Veiculos)]
    public async Task<ActionResult<VeiculoResponseDto>> Put(long id, [FromBody] VeiculoRequestDto dto)
    {
        var potencia = servicoPotencia.GetById(dto.PotenciaId);
        if (potencia is null)
        {
            return BadRequest("Potência não encontrada.");
        }

        var (motorista, erro) = await ResolverMotoristaAsync(dto.MotoristaAtualId);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PutCore(id, dto.ToEntity(potencia, motorista));
    }

    [HttpPut("{id:long}/kilometragem")]
    [ExigePermissao(Permissao.AtualizarKm)]
    public IActionResult AtualizarKilometragem(long id, [FromBody] int distancia)
    {
        var res = servicoVeiculo.AtualizarKmVeiculo(id, distancia);
        return res ? Ok() : BadRequest(servicoVeiculo.Mensagens);
    }

    /// <summary>
    /// Histórico de km do caminhão, do mais novo para o mais velho: cadastro, Atualizar km, OS,
    /// edição e correções, com quem mudou, quando e de quanto pra quanto.
    /// </summary>
    [HttpGet("{id:long}/historico-km")]
    public ActionResult<IEnumerable<RegistroKmResponseDto>> GetHistoricoKm(long id) =>
        servicoRegistroKm.Query(r => r.Veiculo.Id == id)
            .OrderByDescending(r => r.RegistradoEm)
            .ThenByDescending(r => r.Id)
            .Select(RegistroKmDtoExtensions.Projecao)
            .ToList();

    /// <summary>
    /// Corrige o km (ex.: um zero a mais no Atualizar km ou na OS). Só Admin e Gestor. Pode baixar o km,
    /// mas não para menos que o km da maior OS do caminhão. O motivo é obrigatório e fica no histórico.
    /// </summary>
    [HttpPut("{id:long}/corrigir-km")]
    [SomenteGestao]
    public IActionResult CorrigirKm(long id, [FromBody] CorrecaoKmRequestDto dto)
    {
        if (servicoVeiculo.CorrigirKm(id, dto.Km, dto.Motivo) is not null)
        {
            return NoContent();
        }

        return servicoVeiculo.Mensagens.Count == 0
            ? NotFound()
            : BadRequest(string.Join(" ", servicoVeiculo.Mensagens));
    }

    // O motorista atual é opcional; quando vem, tem que ser um acesso ativo com cargo Motorista
    private async Task<(Usuario? motorista, string? erro)> ResolverMotoristaAsync(string? motoristaId)
    {
        if (string.IsNullOrEmpty(motoristaId))
        {
            return (null, null);
        }

        var motorista = await servicoUsuario.ObterMotoristaAtivoAsync(motoristaId);
        if (motorista is null)
        {
            return (null, "Motorista não encontrado ou inativo.");
        }

        return (motorista, null);
    }
}
