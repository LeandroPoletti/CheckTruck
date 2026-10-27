using CheckTruck.Dominio.Entidades;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.SignalR;

namespace CheckTruck.Api.Avisos;

/// <summary>
/// Vale para todas as rotas: depois de uma mudança que deu certo (POST, PUT, PATCH ou DELETE com resposta 2xx) de
/// quem está logado, avisa pelo CanalDeMudancas os outros sites e apps abertos da mesma empresa, que recarregam a
/// tela. A mudança do dono do sistema (catálogo do sistema e empresas) vai para todos. Quem fez a mudança não
/// recebe o aviso: o site e o app mandam o id da conexão deles no cabeçalho X-Conexao.
/// </summary>
public class AvisoDeMudanca(IHubContext<CanalDeMudancas> canal) : IAsyncResultFilter
{
    public const string CabecalhoDaConexao = "X-Conexao";

    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        await next();

        var http = context.HttpContext;
        var mudou = HttpMethods.IsPost(http.Request.Method) || HttpMethods.IsPut(http.Request.Method)
            || HttpMethods.IsPatch(http.Request.Method) || HttpMethods.IsDelete(http.Request.Method);
        // Sem usuário: rota sem filtro de acesso (login e renovação do login)
        if (!mudou || http.Response.StatusCode is < 200 or > 299 || http.Items[typeof(Usuario)] is not Usuario usuario
            || context.ActionDescriptor.EndpointMetadata.OfType<SemAvisoDeMudancaAttribute>().Any())
        {
            return;
        }

        var quemMudou = http.Request.Headers[CabecalhoDaConexao].ToString();
        string[] menos = quemMudou.Length > 0 ? [quemMudou] : [];
        var destino = usuario.EmpresaId is long empresaId
            ? canal.Clients.GroupExcept(CanalDeMudancas.GrupoDaEmpresa(empresaId), menos)
            : canal.Clients.AllExcept(menos);
        await destino.SendAsync(CanalDeMudancas.Mudou);
    }
}

/// <summary>
/// A rota grava o que não aparece em tela nenhuma (ex.: o celular, para os avisos): não avisa ninguém.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class SemAvisoDeMudancaAttribute : Attribute
{
}
