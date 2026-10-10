using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Modelos;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Modelos (linhas) de cada fabricante: FH, FM, R, Actros... Filtro útil: ?$filter=Fabricante/Id eq 1
/// Ler: basta estar logado (os formulários usam a lista). Criar, editar e apagar: Cadastros
/// (o modelo do sistema só o dono do sistema muda; a empresa cadastra os dela)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class ModeloController(
    ServicoModelo servicoModelo,
    ServicoCrud<Fabricante> servicoFabricante,
    ILogger<Modelo> logger)
    : CrudController<Modelo, ModeloResponseDto>(
        servicoModelo, "modelo", logger,
        m => m.ToResponseDto(),
        q => q.Include(m => m.Fabricante))
{
    [HttpGet]
    public ActionResult<IEnumerable<ModeloResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<ModeloResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<ModeloResponseDto> Post([FromBody] ModeloRequestDto dto)
    {
        var fabricante = servicoFabricante.GetById(dto.FabricanteId);
        if (fabricante is null)
        {
            return Erro("Fabricante não encontrado.");
        }

        return PostCore(dto.ToEntity(fabricante));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<ModeloResponseDto> Put(long id, [FromBody] ModeloRequestDto dto)
    {
        var fabricante = servicoFabricante.GetById(dto.FabricanteId);
        if (fabricante is null)
        {
            return Erro("Fabricante não encontrado.");
        }

        return PutCore(id, dto.ToEntity(fabricante));
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public IActionResult Delete(long id) => DeleteCore(id);
}
