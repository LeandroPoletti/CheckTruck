using System.Threading.RateLimiting;
using CheckTruck.Repositorio;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CheckTruck.Api.Servidor;

/// <summary>
/// O que a API precisa para rodar no servidor (AWS, pasta servidor): o IP de quem acessou atrás do CloudFront e do
/// Caddy, limite de tentativas de login por IP, erro 500 com mensagem para o usuário, as chaves do token guardadas
/// fora do container e GET api/saude para conferir se a API e o banco estão no ar. O https fica no CloudFront (quem
/// chega por http vai para o https lá); dentro do servidor a API recebe por http.
/// </summary>
public static class Protecoes
{
    /// <summary>Regra de limite do login (AuthController).</summary>
    public const string LimiteDoLogin = "login";

    public static void AddProtecoes(this WebApplicationBuilder builder)
    {
        // O CloudFront põe no X-Forwarded-For o IP de quem acessou, e o Caddy põe o do CloudFront: o IP certo é o 2º
        // da direita. O que vier antes pode ter sido inventado por quem chamou. Só o CloudFront chega no servidor
        // (grupo de segurança da AWS), e a API nem tem porta aberta para fora do Docker.
        builder.Services.Configure<ForwardedHeadersOptions>(opcoes =>
        {
            opcoes.ForwardedHeaders = ForwardedHeaders.XForwardedFor;
            opcoes.ForwardLimit = 2;
            opcoes.KnownIPNetworks.Clear();
            opcoes.KnownProxies.Clear();
        });

        // Até 10 tentativas de login por minuto do mesmo IP. O bloqueio da conta (5 senhas erradas) continua valendo.
        builder.Services.AddRateLimiter(opcoes =>
        {
            opcoes.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            opcoes.AddPolicy(LimiteDoLogin, contexto => RateLimitPartition.GetFixedWindowLimiter(
                contexto.Connection.RemoteIpAddress?.ToString() ?? "sem-ip",
                _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));
            opcoes.OnRejected = (contexto, _) => new ValueTask(Results.Problem(
                title: "Muitas tentativas",
                detail: "Muitas tentativas de entrar. Espere 1 minuto e tente de novo.",
                statusCode: StatusCodes.Status429TooManyRequests).ExecuteAsync(contexto.HttpContext));
        });

        // Erro que ninguém tratou (500): sai no mesmo formato dos outros erros, com uma mensagem para o usuário
        builder.Services.AddProblemDetails(opcoes => opcoes.CustomizeProblemDetails = contexto =>
        {
            if (contexto.ProblemDetails.Status == StatusCodes.Status500InternalServerError)
            {
                contexto.ProblemDetails.Title = "Erro no servidor";
                contexto.ProblemDetails.Detail = "Algo deu errado do nosso lado. Tente de novo em instantes.";
            }
        });

        builder.Services.AddHealthChecks().AddCheck<BancoNoAr>("banco");

        // As chaves que assinam os tokens. No servidor ficam numa pasta fora do container (ChavesDoToken__Pasta):
        // reiniciar ou subir uma versão nova da API não desloga ninguém
        var pasta = builder.Configuration["ChavesDoToken:Pasta"];
        if (!string.IsNullOrWhiteSpace(pasta))
        {
            builder.Services.AddDataProtection()
                .SetApplicationName("CheckTruck")
                .PersistKeysToFileSystem(new DirectoryInfo(pasta));
        }
    }

    public static void UseProtecoes(this WebApplication app)
    {
        app.UseForwardedHeaders();
        if (!app.Environment.IsDevelopment())
        {
            // No desenvolvimento continua a página de erro do .NET, com o detalhe para quem está programando
            app.UseExceptionHandler();
        }

        app.UseRateLimiter();
        app.MapHealthChecks("/api/saude");
    }
}

/// <summary>Saúde da API (GET api/saude): responde Healthy quando consegue falar com o banco.</summary>
internal sealed class BancoNoAr(Context context) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext contexto, CancellationToken cancelamento = default) =>
        await context.Database.CanConnectAsync(cancelamento)
            ? HealthCheckResult.Healthy()
            : HealthCheckResult.Unhealthy("Sem conexão com o banco.");
}
