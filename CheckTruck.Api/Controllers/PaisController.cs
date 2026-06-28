using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class PaisController(ServicoCrud<Pais> servicoCrud) : ControllerBase
{
    private readonly ServicoCrud<Pais> _servicoCrud = servicoCrud;
    
    [HttpGet("{id:long}")]
    public IActionResult GetById(long id)
    {
        var pais = _servicoCrud.GetById(id);
        if (pais is null)
        {
            return NotFound();
        }
        return Ok(pais);
    }
    
    [HttpPost]
    public IActionResult Post([FromBody] Pais pais)
    {
        var paisInserido = _servicoCrud.Inserir(pais);
        if (paisInserido is null)
        {
            return Problem(detail: string.Join(", ", _servicoCrud.Mensagens), statusCode: 400, title: "Erro ao inserir pais");
        }
        
        return CreatedAtAction(nameof(GetById), new { id = paisInserido.Id }, paisInserido);
    }
    
    [HttpPut("{id:long}")]
    public IActionResult Put(long id, [FromBody] Pais pais)
    {
        if (id != pais.Id)
        {
            return BadRequest("O ID do pais não corresponde ao ID do corpo da requisição.");
        }

        var paisAtualizado = _servicoCrud.Atualizar(pais);
        if (paisAtualizado is null)
        {
            return Problem(detail: string.Join(", ", _servicoCrud.Mensagens), statusCode: 400, title: "Erro ao atualizar pais");
        }

        return Ok(paisAtualizado);
    }

    [HttpDelete("{id:long}")]
    public IActionResult Delete(long id)
    {

        var res = _servicoCrud.Deletar(id);
        
        if (res is null && _servicoCrud.Mensagens.Count == 0)
        {
            return NotFound();
        }
        
        return _servicoCrud.Mensagens.Count != 0 ? Problem(detail: string.Join(", ", _servicoCrud.Mensagens), statusCode: 400, title: "Erro ao deletar pais") : NoContent();
    }
}