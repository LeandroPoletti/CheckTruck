using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Query.Validator;
using Microsoft.OData;
using Microsoft.OData.Edm;

namespace CheckTruck.Api.Controllers;

public abstract class CrudController<TEntity, TResponseDto>(
    ServicoCrud<TEntity> servicoCrud,
    string nomeEntidade,
    ILogger<TEntity> logger,
    Func<TEntity, TResponseDto> toResponseDto,
    Func<IQueryable<TEntity>, IQueryable<TEntity>>? include = null) : ControllerBase
    where TEntity : class, EntidadeBanco
{
    private readonly ServicoCrud<TEntity> _servicoCrud = servicoCrud;
    private readonly ILogger<TEntity> _logger = logger;
    private readonly Func<TEntity, TResponseDto> _toResponseDto = toResponseDto;
    private readonly Func<IQueryable<TEntity>, IQueryable<TEntity>>? _include = include;

    protected virtual ActionResult<IEnumerable<TResponseDto>> GetODataCore()
    {
        _logger.LogDebug($"Consultando lista de {nomeEntidade} com opções OData");

        var edmModel = HttpContext.RequestServices.GetRequiredService<IEdmModel>();
        var contexto = new ODataQueryContext(edmModel, typeof(TEntity), path: null);
        var opcoesQuery = new ODataQueryOptions<TEntity>(contexto, Request);

        try
        {
            opcoesQuery.Validate(new ODataValidationSettings
            {
                MaxTop = 100,
                AllowedQueryOptions = AllowedQueryOptions.Filter
                    | AllowedQueryOptions.OrderBy
                    | AllowedQueryOptions.Top
                    | AllowedQueryOptions.Skip
                    | AllowedQueryOptions.Count
            });
        }
        catch (ODataException e)
        {
            return BadRequest(e.Message);
        }

        var query = _servicoCrud.Query(_ => true, _include);
        var resultado = (IQueryable<TEntity>)opcoesQuery.ApplyTo(query, new ODataQuerySettings { EnsureStableOrdering = true });

        return Ok(resultado.ToList().Select(_toResponseDto).ToList());
    }

    protected virtual ActionResult<TResponseDto> GetByIdCore(long id)
    {
        _logger.LogDebug($"Buscando {nomeEntidade} com ID: {id}");
        var entidade = _servicoCrud.GetById(id, _include);
        if (entidade is null)
        {
            return NotFound();
        }

        return _toResponseDto(entidade);
    }

    protected virtual ActionResult<TResponseDto> PostCore(TEntity entidade)
    {
        _logger.LogDebug($"Inserindo {nomeEntidade}");
        var entidadeInserida = _servicoCrud.Inserir(entidade);
        if (entidadeInserida is null)
        {
            return Erro($"Erro ao inserir {nomeEntidade}");
        }

        var entidadeCompleta = _servicoCrud.GetById(entidadeInserida.Id, _include) ?? entidadeInserida;
        return CreatedAtAction("GetById", new { id = entidadeInserida.Id }, _toResponseDto(entidadeCompleta));
    }

    protected virtual ActionResult<TResponseDto> PutCore(long id, TEntity entidade)
    {
        entidade.Id = id;

        _logger.LogDebug($"Atualizando {nomeEntidade} com ID: {id}");
        var entidadeAtualizada = _servicoCrud.Atualizar(entidade);
        if (entidadeAtualizada is null)
        {
            return Erro($"Erro ao atualizar {nomeEntidade}");
        }

        var entidadeCompleta = _servicoCrud.GetById(id, _include) ?? entidadeAtualizada;
        return _toResponseDto(entidadeCompleta);
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
