using System.Collections;
using System.Linq.Expressions;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Testes.Apoio;

/// <summary>
/// Banco de mentira para os testes: cada tipo é uma lista na memória e as consultas rodam com LINQ comum.
/// Serve para as regras que leem dados. Não tem filtro de empresa nem transação de verdade.
/// </summary>
public sealed class RepositorioEmMemoria : IRepositorioCrud
{
    private readonly Dictionary<Type, IList> _tabelas = new();

    public List<T> Tabela<T>() where T : class
    {
        if (!_tabelas.TryGetValue(typeof(T), out var tabela))
        {
            tabela = new List<T>();
            _tabelas[typeof(T)] = tabela;
        }

        return (List<T>)tabela;
    }

    public T? GetById<T>(long id, Func<IQueryable<T>, IQueryable<T>>? include = null) where T : class, EntidadeBanco =>
        Tabela<T>().FirstOrDefault(e => e.Id == id);

    public T Add<T>(T entity) where T : class
    {
        Tabela<T>().Add(entity);
        return entity;
    }

    public T Update<T>(T entity) where T : class => entity;

    public T? Delete<T>(long id) where T : class, EntidadeBanco
    {
        var entidade = GetById<T>(id);
        if (entidade is not null)
        {
            Tabela<T>().Remove(entidade);
        }

        return entidade;
    }

    public IQueryable<T> Query<T>(Expression<Func<T, bool>> where, Func<IQueryable<T>, IQueryable<T>>? include = null) where T : class =>
        Tabela<T>().AsQueryable().Where(where);

    public IQueryable<T> QueryTodasAsEmpresas<T>(Expression<Func<T, bool>> where) where T : class =>
        Tabela<T>().AsQueryable().Where(where);

    public void MakeTransaction(Action<IRepositorioCrud> action) => action(this);
}
