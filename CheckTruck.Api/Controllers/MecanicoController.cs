using CheckTruck.Api.Dtos.Mecanicos;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

/// <summary>
/// Cadastro de mecânicos (nome e função), usado na OS para dizer quem fez a troca.
/// É só um cadastro: o mecânico da OS não tem login nem ligação com os usuários do sistema.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MecanicoController(
    ServicoCrud<Mecanico> servicoCrud,
    ServicoCrud<Manutencao> servicoManutencao,
    ILogger<Mecanico> logger)
    : CrudController<Mecanico, MecanicoResponseDto>(servicoCrud, "mecânico", logger, m => m.ToResponseDto())
{
    [HttpGet]
    public ActionResult<IEnumerable<MecanicoResponseDto>> Get() => GetODataCore();

    [HttpGet("{id:long}")]
    public ActionResult<MecanicoResponseDto> GetById(long id) => GetByIdCore(id);

    [HttpPost]
    public ActionResult<MecanicoResponseDto> Post([FromBody] MecanicoRequestDto dto) => PostCore(dto.ToEntity());

    [HttpPut("{id:long}")]
    public ActionResult<MecanicoResponseDto> Put(long id, [FromBody] MecanicoRequestDto dto) => PutCore(id, dto.ToEntity());

    /// <summary>Só exclui mecânico sem OS lançada; com histórico, o certo é desativar.</summary>
    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id)
    {
        if (servicoManutencao.Query(m => m.Mecanico.Id == id).Any())
        {
            return BadRequest("Esse mecânico tem OS lançadas. Desative o cadastro em vez de excluir.");
        }

        return DeleteCore(id);
    }
}
