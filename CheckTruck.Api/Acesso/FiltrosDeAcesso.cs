using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CheckTruck.Api.Acesso;

/// <summary>
/// Base dos filtros de acesso: carrega quem está logado (pelo token) e barra quem não está logado
/// ou está inativo (401). Cada filtro filho diz o que mais a rota exige (403 quando falta).
/// </summary>
public abstract class FiltroDeAcessoAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        // O controller e a rota podem ter um filtro cada: o segundo reaproveita o usuário que o primeiro carregou
        if (context.HttpContext.Items[typeof(Usuario)] is not Usuario usuario)
        {
            var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<Usuario>>();
            usuario = await userManager.GetUserAsync(context.HttpContext.User);
        }

        if (usuario is null || !usuario.Ativo)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (!Permite(usuario))
        {
            context.Result = new ObjectResult("Você não tem permissão para fazer isso.")
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
            return;
        }

        context.HttpContext.Items[typeof(Usuario)] = usuario;
    }

    protected abstract bool Permite(Usuario usuario);
}

/// <summary>Exige estar logado, ativo e com a permissão informada. Sem permissão informada, basta estar logado.</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ExigePermissaoAttribute(Permissao permissao = Permissao.Nenhuma) : FiltroDeAcessoAttribute
{
    protected override bool Permite(Usuario usuario) => usuario.Pode(permissao);
}

/// <summary>Só Admin e Gestor: são eles que cuidam dos acessos.</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class SomenteGestaoAttribute : FiltroDeAcessoAttribute
{
    protected override bool Permite(Usuario usuario) => usuario.CuidaDosAcessos;
}

public static class AcessoHttpContextExtensions
{
    /// <summary>Quem está logado. Só existe nas rotas com um dos filtros de acesso acima.</summary>
    public static Usuario UsuarioLogado(this HttpContext httpContext) =>
        (Usuario)httpContext.Items[typeof(Usuario)]!;
}
