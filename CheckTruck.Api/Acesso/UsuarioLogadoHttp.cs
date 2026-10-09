using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Api.Acesso;

/// <summary>
/// Quem está logado, para os serviços do domínio gravarem no histórico. Vem do usuário que os
/// filtros de acesso já carregaram; fora das rotas com filtro, fica null.
/// </summary>
public class UsuarioLogadoHttp(IHttpContextAccessor httpContextAccessor) : IUsuarioLogado
{
    public Usuario? Usuario => httpContextAccessor.HttpContext?.Items[typeof(Usuario)] as Usuario;
}
