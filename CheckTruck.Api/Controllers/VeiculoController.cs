using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Veiculos;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

// Ver: Ver frota. Criar, editar e apagar: Veículos. Somar km: Atualizar km
[ApiController]
[Route("api/[controller]")]
[ExigePermissao(Permissao.VerFrota)]
public class VeiculoController(
    ServicoVeiculo servicoVeiculo,
    ServicoSituacaoVeiculo servicoSituacao,
    ServicoCrud<Modelo> servicoModelo,
    ServicoUsuario servicoUsuario,
    ILogger<Veiculo> logger)
    : CrudController<Veiculo, VeiculoResponseDto>(
        servicoVeiculo, "veículo", logger,
        v => v.ToResponseDto(),
        q => q.Include(v => v.Modelo).Include(v => v.MotoristaAtual))
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

    /// <summary>
    /// Situação completa de um caminhão: todos os itens, com km e dias restantes e de onde veio
    /// o intervalo (caminhão, modelo ou padrão). É o que a tela de detalhe mostra.
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
        var modelo = servicoModelo.GetById(dto.ModeloId);
        if (modelo is null)
        {
            return BadRequest("Modelo não encontrado.");
        }

        var (motorista, erro) = await ResolverMotoristaAsync(dto.MotoristaAtualId);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PostCore(dto.ToEntity(modelo, motorista));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Veiculos)]
    public async Task<ActionResult<VeiculoResponseDto>> Put(long id, [FromBody] VeiculoRequestDto dto)
    {
        var modelo = servicoModelo.GetById(dto.ModeloId);
        if (modelo is null)
        {
            return BadRequest("Modelo não encontrado.");
        }

        var (motorista, erro) = await ResolverMotoristaAsync(dto.MotoristaAtualId);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PutCore(id, dto.ToEntity(modelo, motorista));
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Veiculos)]
    public IActionResult Delete(long id) => DeleteCore(id);

    [HttpPut("{id:long}/kilometragem")]
    [ExigePermissao(Permissao.AtualizarKm)]
    public IActionResult AtualizarKilometragem(long id, [FromBody] int distancia)
    {
        var res = servicoVeiculo.AtualizarKmVeiculo(id, distancia);
        return res ? Ok() : BadRequest(servicoVeiculo.Mensagens);
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
