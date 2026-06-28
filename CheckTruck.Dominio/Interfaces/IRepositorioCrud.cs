using System.Linq.Expressions;

namespace CheckTruck.Dominio.Interfaces;

public interface IRepositorioCrud
{
    public T? GetById<T>(long id) where T : class, EntidadeBanco;
    public T Add<T>(T entity) where T : class;
    public T Update<T>(T entity) where T : class;
    public T? Delete<T>(long id) where T : class, EntidadeBanco;
    public IQueryable<T> Query<T>(Expression<Func<T,bool>> where) where T : class;
    public void MakeTransaction(Action<IRepositorioCrud> action);
}
