using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Paises;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

// Ler: basta estar logado (os formulários usam a lista). Criar, editar e apagar: Cadastros
// (o país do sistema só o dono do sistema muda; a empresa cadastra os dela)
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class PaisController(ServicoPais servicoPais, ILogger<Pais> logger)
    : CrudController<Pais, PaisResponseDto>(servicoPais, "país", logger, p => p.ToResponseDto())
{
    [HttpGet]
    public ActionResult<IEnumerable<PaisResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<PaisResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<PaisResponseDto> Post([FromBody] PaisRequestDto dto) => PostCore(dto.ToEntity());

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<PaisResponseDto> Put(long id, [FromBody] PaisRequestDto dto) => PutCore(id, dto.ToEntity());

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public IActionResult Delete(long id) => DeleteCore(id);
}
