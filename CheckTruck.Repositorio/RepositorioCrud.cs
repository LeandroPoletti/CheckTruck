using System.Linq.Expressions;
using CheckTruck.Dominio.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Repositorio;

public class RepositorioCrud : IRepositorioCrud
{
    private readonly Context _context;

    public RepositorioCrud(Context context)
    {
        _context = context;
    }
    public T? GetById<T>(long id) where T : class, EntidadeBanco
    {
        var res = _context.Set<T>().FirstOrDefault(x => x.Id == id);
        return res;
    }

    public T Add<T>(T entity) where T : class
    {
        var res = _context.Set<T>().Add(entity);
        Commit();
        return res.Entity;
    }

    public T Update<T>(T entity) where T : class
    {
        var res = _context.Set<T>().Update(entity);
        Commit();
        return res.Entity;
    }

    public T? Delete<T>(long id) where T : class, EntidadeBanco
    {
        var entidade = _context.Set<T>().FirstOrDefault(x => x.Id == id);
        if (entidade is null)
        {
            return null;
        }
        
        var res = _context.Set<T>().Remove(entidade);
        Commit();
        return res.Entity;
        
    }

    public IQueryable<T> Query<T>(Expression<Func<T, bool>> where) where T : class
    {
        var res = _context.Set<T>().Where(where);
        return res;
    }

    public void Commit()
    {
        _context.SaveChanges();
    }
}
