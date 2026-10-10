using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Itens do catálogo. O do sistema toda empresa vê, mas só o dono do sistema muda; o da empresa só ela vê e muda.
/// O Context já barra no banco quem mexe no item de outro; aqui é para avisar com uma mensagem clara.
/// </summary>
public class ServicoCatalogo<T>(IRepositorioCrud repositorioCrud, IUsuarioLogado usuarioLogado, ILogger<ServicoCatalogo<T>> logger)
    : ServicoCrud<T>(repositorioCrud, logger) where T : class, ItemDoCatalogo
{
    public override T? Atualizar(T entidade) => PodeMexer(entidade.Id) ? base.Atualizar(entidade) : null;

    public override T? Deletar(long id) => PodeMexer(id) ? base.Deletar(id) : null;

    /// <summary>
    /// O item é de quem está logado: do sistema para o dono do sistema, da empresa para a empresa.
    /// Item que não existe passa: quem chama já trata o "não encontrado".
    /// </summary>
    protected bool PodeMexer(long id)
    {
        var item = Query(i => i.Id == id).Select(i => new { i.EmpresaId }).FirstOrDefault();
        if (item is null || item.EmpresaId == usuarioLogado.Usuario?.EmpresaId)
        {
            return true;
        }

        Mensagens.Add("Esse item é do catálogo do sistema: só o dono do sistema muda. Se a sua empresa precisa de outro, cadastre um dela.");
        return false;
    }
}
