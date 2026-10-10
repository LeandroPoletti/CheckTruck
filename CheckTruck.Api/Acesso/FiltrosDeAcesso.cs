using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Acesso;

/// <summary>
/// Base dos filtros de acesso: carrega quem está logado (pelo token), com a empresa dele, e barra quem não
/// está logado ou está inativo (401). Cada filtro filho diz o que mais a rota exige (403 quando falta).
/// </summary>
public abstract class FiltroDeAcessoAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        // O controller e a rota podem ter um filtro cada: o segundo reaproveita o usuário que o primeiro carregou
        var usuario = context.HttpContext.Items[typeof(Usuario)] as Usuario ?? await CarregarAsync(context.HttpContext);

        if (usuario is null || !usuario.Ativo)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (!Permite(usuario))
        {
            // No mesmo formato dos outros erros da API (ProblemDetails, com a mensagem no detail)
            var problema = context.HttpContext.RequestServices.GetRequiredService<ProblemDetailsFactory>()
                .CreateProblemDetails(context.HttpContext, StatusCodes.Status403Forbidden, detail: MensagemSemPermissao);
            context.Result = new ObjectResult(problema) { StatusCode = StatusCodes.Status403Forbidden };
            return;
        }

        context.HttpContext.Items[typeof(Usuario)] = usuario;
    }

    protected abstract bool Permite(Usuario usuario);

    protected virtual string MensagemSemPermissao => "Você não tem permissão para fazer isso.";

    private static async Task<Usuario?> CarregarAsync(HttpContext httpContext)
    {
        var userManager = httpContext.RequestServices.GetRequiredService<UserManager<Usuario>>();
        var id = userManager.GetUserId(httpContext.User);
        return id is null ? null : await userManager.Users.Include(u => u.Empresa).FirstOrDefaultAsync(u => u.Id == id);
    }
}

/// <summary>Exige estar logado, ativo e com a permissão informada. Sem permissão informada, basta estar logado.</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ExigePermissaoAttribute(Permissao permissao = Permissao.Nenhuma) : FiltroDeAcessoAttribute
{
    protected override bool Permite(Usuario usuario) => usuario.Pode(permissao);
}

/// <summary>Exige estar logado, ativo e com pelo menos uma das permissões informadas (juntas com |).</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ExigeUmaDasPermissoesAttribute(Permissao permissoes) : FiltroDeAcessoAttribute
{
    protected override bool Permite(Usuario usuario) => (usuario.PermissoesEfetivas & permissoes) != 0;
}

/// <summary>Só Admin e Gestor: são eles que cuidam dos acessos.</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class SomenteGestaoAttribute : FiltroDeAcessoAttribute
{
    protected override bool Permite(Usuario usuario) => usuario.CuidaDosAcessos;
}

/// <summary>Só conta Frota (ex.: chamados). O Autônomo é uma pessoa só: dirige e cuida do caminhão.</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class SomenteFrotaAttribute : FiltroDeAcessoAttribute
{
    protected override bool Permite(Usuario usuario) => usuario.Empresa?.TipoConta == TipoConta.Frota;

    protected override string MensagemSemPermissao => "Isso é só da conta Frota. Para usar, vire Frota em Minha empresa.";
}

public static class AcessoHttpContextExtensions
{
    /// <summary>Quem está logado. Só existe nas rotas com um dos filtros de acesso acima.</summary>
    public static Usuario UsuarioLogado(this HttpContext httpContext) =>
        (Usuario)httpContext.Items[typeof(Usuario)]!;
}
