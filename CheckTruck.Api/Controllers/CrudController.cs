using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;

namespace CheckTruck.Api.Controllers;

public abstract class CrudController<T>(ServicoCrud<T> servicoCrud, string nomeEntidade, ILogger<T> logger) : ControllerBase
    where T : class, EntidadeBanco
{
    private readonly ServicoCrud<T> _servicoCrud = servicoCrud;
    private readonly ILogger<T> _logger = logger;

    protected virtual IActionResult GetByIdCore(long id)
    {
        _logger.LogDebug($"Buscando {nomeEntidade} com ID: {id}");
        var entidade = _servicoCrud.GetById(id);
        return entidade is null ? NotFound() : Ok(entidade);
    }

    protected virtual IActionResult PostCore(T entidade)
    {
        _logger.LogDebug($"Inserindo {nomeEntidade}");
        var entidadeInserida = _servicoCrud.Inserir(entidade);
        if (entidadeInserida is null)
        {
            return Erro($"Erro ao inserir {nomeEntidade}");
        }

        return CreatedAtAction("GetById", new { id = entidadeInserida.Id }, entidadeInserida);
    }

    protected virtual IActionResult PutCore(long id, T entidade)
    {
        if (id != entidade.Id)
        {
            return BadRequest($"O ID de {nomeEntidade} não corresponde ao ID do corpo da requisição.");
        }

        _logger.LogDebug($"Atualizando {nomeEntidade} com ID: {id}");
        var entidadeAtualizada = _servicoCrud.Atualizar(entidade);
        return entidadeAtualizada is null
            ? Erro($"Erro ao atualizar {nomeEntidade}")
            : Ok(entidadeAtualizada);
    }

    protected virtual IActionResult DeleteCore(long id)
    {
        _logger.LogDebug($"Deletando {nomeEntidade} com ID: {id}");
        var entidade = _servicoCrud.Deletar(id);
        if (entidade is null && _servicoCrud.Mensagens.Count == 0)
        {
            return NotFound();
        }

        return _servicoCrud.Mensagens.Count != 0
            ? Erro($"Erro ao deletar {nomeEntidade}")
            : NoContent();
    }

    private ObjectResult Erro(string titulo) => Problem(
        detail: string.Join(", ", _servicoCrud.Mensagens),
        statusCode: StatusCodes.Status400BadRequest,
        title: titulo);
}
