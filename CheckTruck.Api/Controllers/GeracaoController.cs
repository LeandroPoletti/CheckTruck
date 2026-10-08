using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Geracoes;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Gerações de cada modelo, com as potências em que foram vendidas. Filtro útil: ?$filter=Modelo/Id eq 3
/// Ler: basta estar logado (os formulários usam a lista). Criar, editar e apagar: Cadastros
/// </summary>
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class GeracaoController(
    ServicoGeracao servicoGeracao,
    ServicoCrud<Modelo> servicoModelo,
    ILogger<Geracao> logger)
    : CrudController<Geracao, GeracaoResponseDto>(
        servicoGeracao, "geração", logger,
        g => g.ToResponseDto(),
        q => q.Include(g => g.Modelo).ThenInclude(m => m.Fabricante).Include(g => g.Potencias))
{
    [HttpGet]
    public ActionResult<IEnumerable<GeracaoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<GeracaoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<GeracaoResponseDto> Post([FromBody] GeracaoRequestDto dto)
    {
        var modelo = servicoModelo.GetById(dto.ModeloId);
        if (modelo is null)
        {
            return BadRequest("Modelo não encontrado.");
        }

        return PostCore(dto.ToEntity(modelo));
    }

    /// <summary>As potências que não vierem na lista saem da geração (menos as que têm caminhão).</summary>
    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<GeracaoResponseDto> Put(long id, [FromBody] GeracaoRequestDto dto)
    {
        var modelo = servicoModelo.GetById(dto.ModeloId);
        if (modelo is null)
        {
            return BadRequest("Modelo não encontrado.");
        }

        return PutCore(id, dto.ToEntity(modelo));
    }

    /// <summary>Geração com caminhão ou intervalo cadastrado não pode ser excluída.</summary>
    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public IActionResult Delete(long id) => DeleteCore(id);
}
