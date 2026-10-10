using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Fabricantes;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

// Ler: basta estar logado (os formulários usam a lista). Criar, editar e apagar: Cadastros
// (o fabricante do sistema só o dono do sistema muda; a empresa cadastra os dela)
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class FabricanteController(
    ServicoFabricante servicoFabricante,
    ServicoCrud<Pais> servicoPais,
    ILogger<Fabricante> logger)
    : CrudController<Fabricante, FabricanteResponseDto>(
        servicoFabricante, "fabricante", logger,
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
    public IActionResult Delete(long id) => DeleteCore(id);
}
