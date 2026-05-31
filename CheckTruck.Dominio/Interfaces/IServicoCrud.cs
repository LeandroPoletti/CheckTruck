namespace CheckTruck.Dominio.Interfaces;

public interface IServicoCrud<T> where T : class
{
    public T GetById(long id);
    public void Add(T entity);
    public void Update(T entity);
    public T Delete(long id);
    public IQueryable<T> Query(Func<T,bool> where);
}