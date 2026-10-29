using System.Linq.Expressions;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Servicos;
using Microsoft.Extensions.Logging.Abstractions;

namespace CheckTruck.Testes.Servicos;

/// <summary>Duas pessoas editando a mesma coisa: quando o banco recusa porque alguém gravou antes, quem salvou depois recebe o aviso.</summary>
public class ConflitoDeEdicaoTests
{
    [Fact]
    public void Quem_salva_depois_recebe_o_aviso()
    {
        var servico = new ServicoCrud<Mecanico>(new BancoQueRecusa(), NullLogger<ServicoCrud<Mecanico>>.Instance);

        Assert.Null(servico.Atualizar(new Mecanico { Id = 1, Nome = "João", Funcao = "Mecânico", Ativo = true }));
        Assert.Equal(new[] { ServicoCrud<Mecanico>.ConflitoDeEdicao }, servico.Mensagens);
    }

    // Como o banco quando a versão que veio não é mais a de lá: não acha a linha para gravar
    private sealed class BancoQueRecusa : IRepositorioCrud
    {
        public T Update<T>(T entity) where T : class => throw new ConflitoDeEdicaoException(new Exception("Nenhuma linha gravada."));

        public T? GetById<T>(long id, Func<IQueryable<T>, IQueryable<T>>? include = null) where T : class, EntidadeBanco =>
            throw new NotSupportedException();

        public T Add<T>(T entity) where T : class => throw new NotSupportedException();

        public T? Delete<T>(long id) where T : class, EntidadeBanco => throw new NotSupportedException();

        public IQueryable<T> Query<T>(Expression<Func<T, bool>> where, Func<IQueryable<T>, IQueryable<T>>? include = null) where T : class =>
            throw new NotSupportedException();

        public IQueryable<T> QueryTodasAsEmpresas<T>(Expression<Func<T, bool>> where) where T : class => throw new NotSupportedException();

        public void MakeTransaction(Action<IRepositorioCrud> action) => throw new NotSupportedException();
    }
}
