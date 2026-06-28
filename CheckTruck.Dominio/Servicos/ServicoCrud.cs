using System.Linq.Expressions;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Servicos;

public class ServicoCrud<T>(IRepositorioCrud repositorioCrud) where T : class, EntidadeBanco
{
    private readonly IRepositorioCrud _repositorioCrud = repositorioCrud;

    public List<string> Mensagens { get; set; } = new();

    /// <summary>
    /// Metódo para validação de entidade antes de operações de INSERT/UPDATE. Erros de validação devem ser adicionados a lista de mensagens.
    /// </summary>
    /// <param name="entidade"></param>
    /// <returns></returns>
    public virtual bool Valida(T entidade)
    {
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
                Mensagens.Add(e.Message);
                return new List<T>().AsQueryable();
            }
        }

        public T? GetById(long id)
        {
            try
            {
                var retorno = _repositorioCrud.GetById<T>(id);

                return retorno;
            }
            catch (Exception e)
            {
                Mensagens.Add(e.Message);
                return null;
            }
        }

    #endregion

    #region Operacoes de escrita
    
        public virtual T? Inserir(T entidade)
        {
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
                Mensagens.Add(e.Message);
                return null;
            }
        }

        public virtual T? Atualizar(T entidade)
        {
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
                Mensagens.Add(e.Message);
                return null;
            }
        }

        public virtual T? Deletar(long id)
        {
            try
            {
                var retorno = _repositorioCrud.Delete<T>(id);

                return retorno;
            }
            catch (Exception e)
            {
                Mensagens.Add(e.Message);
                return null;
            }
        }
    
    #endregion
}