using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Itens do catálogo. O do sistema toda empresa vê, mas só o dono do sistema muda; o da empresa só ela vê e muda.
/// O Context já barra no banco quem mexe no item de outro; aqui é para avisar com uma mensagem clara.
/// Cada item do catálogo tem o serviço dele (ServicoPais, ServicoGeracao...) com as regras próprias.
/// </summary>
public abstract class ServicoCatalogo<T>(IRepositorioCrud repositorioCrud, IUsuarioLogado usuarioLogado, ILogger<ServicoCatalogo<T>> logger)
    : ServicoCrud<T>(repositorioCrud, logger) where T : class, ItemDoCatalogo
{
    public override T? Atualizar(T entidade) => PodeMexer(entidade.Id) ? base.Atualizar(entidade) : null;

    /// <summary>
    /// Primeiro confere se o item é de quem está logado; só depois se está em uso. O "em uso" do catálogo olha
    /// todas as empresas (o item do sistema é de todas), e assim a empresa não vê números das outras.
    /// </summary>
    public override T? Deletar(long id) => PodeMexer(id) ? base.Deletar(id) : null;

    /// <summary>Empresa de quem está logado; null para o dono do sistema (o catálogo do sistema não tem empresa).</summary>
    protected long? EmpresaAtual => usuarioLogado.Usuario?.EmpresaId;

    /// <summary>
    /// O item é de quem está logado: do sistema para o dono do sistema, da empresa para a empresa.
    /// Item que não existe passa: quem chama já trata o "não encontrado".
    /// </summary>
    protected bool PodeMexer(long id)
    {
        var item = Query(i => i.Id == id).Select(i => new { i.EmpresaId }).FirstOrDefault();
        if (item is null || item.EmpresaId == EmpresaAtual)
        {
            return true;
        }

        Mensagens.Add("Esse item é do catálogo do sistema: só o dono do sistema muda. Se a sua empresa precisa de outro, cadastre um dela.");
        return false;
    }
}
