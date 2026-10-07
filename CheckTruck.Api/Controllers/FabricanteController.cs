using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Fabricantes;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

// Ler: basta estar logado (os formulários usam a lista). Criar, editar e apagar: Cadastros
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class FabricanteController(
    ServicoCrud<Fabricante> servicoCrud,
    ServicoCrud<Pais> servicoPais,
    ServicoCrud<GeracaoModelo> servicoGeracao,
    ILogger<Fabricante> logger)
    : CrudController<Fabricante, FabricanteResponseDto>(
        servicoCrud, "fabricante", logger,
        f => f.ToResponseDto(),
        q => q.Include(f => f.PaisOrigem))
{
    [HttpGet]
    public ActionResult<IEnumerable<FabricanteResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<FabricanteResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<FabricanteResponseDto> Post([FromBody] FabricanteRequestDto dto)
    {
        var paisOrigem = servicoPais.GetById(dto.PaisOrigemId);
        if (paisOrigem is null)
        {
            return BadRequest("País de origem não encontrado.");
        }

        return PostCore(dto.ToEntity(paisOrigem));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<FabricanteResponseDto> Put(long id, [FromBody] FabricanteRequestDto dto)
    {
        var paisOrigem = servicoPais.GetById(dto.PaisOrigemId);
        if (paisOrigem is null)
        {
            return BadRequest("País de origem não encontrado.");
        }

        return PutCore(id, dto.ToEntity(paisOrigem));
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public IActionResult Delete(long id)
    {
        var geracoes = servicoGeracao.Query(g => g.Fabricante.Id == id).Count();
        if (geracoes > 0)
        {
            return BadRequest($"Não é possível excluir: o fabricante possui {geracoes} geração(ões) cadastrada(s).");
        }

        return DeleteCore(id);
    }
}
