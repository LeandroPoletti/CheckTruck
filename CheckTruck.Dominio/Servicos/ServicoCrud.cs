using System.Linq.Expressions;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

public class ServicoCrud<T>(IRepositorioCrud repositorioCrud, ILogger<ServicoCrud<T>> logger) where T : class, EntidadeBanco
{
    private readonly IRepositorioCrud _repositorioCrud = repositorioCrud;
    private readonly ILogger<ServicoCrud<T>> _logger = logger;

    public List<string> Mensagens { get; set; } = new();

    /// <summary>
    /// Metódo para validação de entidade antes de operações de INSERT/UPDATE. Erros de validação devem ser adicionados a lista de mensagens.
    /// </summary>
    /// <param name="entidade"></param>
    /// <returns></returns>
    public virtual bool Valida(T entidade)
    {
        _logger.LogDebug($"Validando entidade do tipo {typeof(T).Name}");
        return Mensagens.Count == 0;
    }

    #region Operacoes de leitura

        public IQueryable<T> Query(Expression<Func<T, bool>> where)
        {
            try
            {
                var retorno = _repositorioCrud.Query(where);

                return retorno;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erro ao consultar entidade do tipo {Tipo}", typeof(T).Name);
                Mensagens.Add(e.Message);
                return new List<T>().AsQueryable();
            }
        }

        public T? GetById(long id)
        {
            _logger.LogDebug($"Consultando entidade do tipo {typeof(T).Name} com ID: {id}");
            try
            {
                var retorno = _repositorioCrud.GetById<T>(id);

                return retorno;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erro ao consultar entidade do tipo {Tipo}", typeof(T).Name);
                _logger.LogDebug($"Mensagens: {string.Join(", ", Mensagens)}");
                Mensagens.Add(e.Message);
                return null;
            }
        }

    #endregion

    #region Operacoes de escrita
    
        public virtual T? Inserir(T entidade)
        {
            _logger.LogDebug($"Inserindo entidade do tipo {typeof(T).Name}");
            try
            {
                if (!Valida(entidade))
                {
                    return null;
                }

                var retorno = _repositorioCrud.Add(entidade);

                return retorno;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erro ao inserir entidade do tipo {Tipo}", typeof(T).Name);
                Mensagens.Add(e.Message);
                return null;
            }
        }

        public virtual T? Atualizar(T entidade)
        {
            _logger.LogDebug($"Atualizando entidade do tipo {typeof(T).Name} ID: {entidade.Id}");
            try
            {
                if (!Valida(entidade))
                {
                    return null;
                }

                var retorno = _repositorioCrud.Update(entidade);

                return retorno;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erro ao atualizar entidade do tipo {Tipo}", typeof(T).Name);
                _logger.LogDebug($"Mensagens: {string.Join(", ", Mensagens)}");
                Mensagens.Add(e.Message);
                return null;
            }
        }

        public virtual T? Deletar(long id)
        {
            _logger.LogDebug($"Deletando entidade do tipo {typeof(T).Name} ID: {id}");
            try
            {
                var retorno = _repositorioCrud.Delete<T>(id);

                return retorno;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erro ao deletar entidade do tipo {Tipo}", typeof(T).Name);
                _logger.LogDebug($"Mensagens: {string.Join(", ", Mensagens)}");
                Mensagens.Add(e.Message);
                return null;
            }
        }

        public virtual bool MakeTransaction(Action<IRepositorioCrud> action)
        {
            _logger.LogDebug($"Executando transação para entidade do tipo {typeof(T).Name}");
            try
            {
                _repositorioCrud.MakeTransaction(action);
                return true;
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erro ao executar transação");
                _logger.LogDebug($"Mensagens: {string.Join(", ", Mensagens)}");
                Mensagens.Add(e.Message);
                return false;
            }
        }
    
    #endregion
}