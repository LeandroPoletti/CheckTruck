using CheckTruck.Api.Acesso;
using CheckTruck.Api.Dtos.Mecanicos;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Cadastro de mecânicos (nome e função), usado na OS para dizer quem fez a troca.
/// É só um cadastro: o mecânico da OS não tem login nem ligação com os usuários do sistema.
/// Ler: basta estar logado (a OS usa a lista). Criar, editar e apagar: Cadastros
/// </summary>
[ApiController]
[Route("api/[controller]")]
[ExigePermissao]
public class MecanicoController(ServicoMecanico servicoMecanico, ILogger<Mecanico> logger)
    : CrudController<Mecanico, MecanicoResponseDto>(servicoMecanico, "mecânico", logger, m => m.ToResponseDto())
{
    [HttpGet]
    public ActionResult<IEnumerable<MecanicoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<MecanicoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<MecanicoResponseDto> Post([FromBody] MecanicoRequestDto dto) => PostCore(dto.ToEntity());

    [HttpPut("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public ActionResult<MecanicoResponseDto> Put(long id, [FromBody] MecanicoRequestDto dto) => PutCore(id, dto.ToEntity());

    /// <summary>Só exclui mecânico sem OS lançada; com histórico, o certo é desativar.</summary>
    [HttpDelete("{id:long}")]
    [ExigePermissao(Permissao.Cadastros)]
    public IActionResult Delete(long id) => DeleteCore(id);
}
