using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.IntervalosVeiculo;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Intervalos próprios de um caminhão (ex.: plano da concessionária). Têm prioridade sobre o
/// intervalo da geração e sobre o padrão seguro. Filtro útil: ?$filter=Veiculo/Id eq 5
/// Ler: basta estar logado (a situação dos caminhões usa os intervalos). Criar, editar e apagar: Intervalos
/// </summary>
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class IntervaloVeiculoController(
    ServicoIntervaloVeiculo servicoIntervalo,
    ServicoCrud<Veiculo> servicoVeiculo,
    ServicoCrud<TipoManutencao> servicoTipoManutencao,
    ILogger<IntervaloVeiculo> logger)
    : CrudController<IntervaloVeiculo, IntervaloVeiculoResponseDto>(
        servicoIntervalo, "intervalo do veículo", logger,
        i => i.ToResponseDto(),
        q => q.Include(i => i.Veiculo).Include(i => i.TipoManutencao))
{
    [HttpGet]
    public ActionResult<IEnumerable<IntervaloVeiculoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<IntervaloVeiculoResponseDto> GetById(long id) => GetByIdCore(id);

    /// <summary>
    /// Caminhões ativos (com a geração) para escolher na tela de intervalos. Fica aqui porque quem cuida
    /// dos intervalos pode não ter a permissão Ver frota.
    /// </summary>
    [HttpGet("veiculos")]
    [ExigePermissao(Permissao.Intervalos)]
    public ActionResult<IEnumerable<VeiculoDoIntervaloDto>> Veiculos() =>
        servicoVeiculo.Query(v => v.Ativo)
            .OrderBy(v => v.Placa)
            .Select(v => new VeiculoDoIntervaloDto
            {
                Id = v.Id,
                Placa = v.Placa,
                FabricanteNome = v.Potencia.Geracao.Modelo.Fabricante.Nome,
                ModeloNome = v.Potencia.Geracao.Modelo.Nome,
                GeracaoId = v.Potencia.Geracao.Id,
                GeracaoNome = v.Potencia.Geracao.Nome,
                PotenciaCv = v.Potencia.Cv,
            })
            .ToList();

    [HttpPost]
    [ExigePermissao(Permissao.Intervalos)]
    public ActionResult<IntervaloVeiculoResponseDto> Post([FromBody] IntervaloVeiculoRequestDto dto)
    {
        var (veiculo, tipoManutencao, erro) = ResolverRelacionados(dto);
        if (erro is not null)
        {
            return Erro(erro);
        }

        return PostCore(dto.ToEntity(veiculo!, tipoManutencao!));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Intervalos)]
    public ActionResult<IntervaloVeiculoResponseDto> Put(long id, [FromBody] IntervaloVeiculoRequestDto dto)
    {
        var (veiculo, tipoManutencao, erro) = ResolverRelacionados(dto);
        if (erro is not null)
        {
            return Erro(erro);
        }

        return PutCore(id, dto.ToEntity(veiculo!, tipoManutencao!));
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Intervalos)]
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
