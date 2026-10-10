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
        var (fabricante, erro) = ResolverFabricante(dto, idIgnorar: null);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PostCore(dto.ToEntity(fabricante!));
    }

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<ModeloResponseDto> Put(long id, [FromBody] ModeloRequestDto dto)
    {
        var (fabricante, erro) = ResolverFabricante(dto, idIgnorar: id);
        if (erro is not null)
        {
            return BadRequest(erro);
        }

        return PutCore(id, dto.ToEntity(fabricante!));
    }

    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public IActionResult Delete(long id) => DeleteCore(id);

    // O fabricante existe e ainda não tem um modelo com esse nome
    private (Fabricante? fabricante, string? erro) ResolverFabricante(ModeloRequestDto dto, long? idIgnorar)
    {
        var fabricante = servicoFabricante.GetById(dto.FabricanteId);
        if (fabricante is null)
        {
            return (null, "Fabricante não encontrado.");
        }

        var nome = dto.Nome.Trim().ToLower();
        var jaExiste = Servico
            .Query(m => m.Id != idIgnorar && m.Fabricante.Id == dto.FabricanteId && m.Nome.ToLower() == nome)
            .Any();
        if (jaExiste)
        {
            return (null, "Esse fabricante já tem um modelo com esse nome.");
        }

        return (fabricante, null);
    }
}
