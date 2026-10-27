using CheckTruck.Dominio.Entidades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Avisos;

/// <summary>
/// Canal aberto com cada site e app (SignalR): quando alguém da empresa muda alguma coisa, chega "mudou" e a tela
/// aberta recarrega sozinha (ver AvisoDeMudanca). Cada conexão fica no grupo da empresa de quem entrou. Quem está
/// inativo ou é de uma empresa desativada não entra, igual aos filtros de acesso.
/// </summary>
[Authorize]
public class CanalDeMudancas(UserManager<Usuario> userManager) : Hub
{
    public const string Caminho = "/hubs/mudancas";

    /// <summary>O que chega no site e no app quando algo muda.</summary>
    public const string Mudou = "mudou";

    public static string GrupoDaEmpresa(long empresaId) => $"empresa-{empresaId}";

    public override async Task OnConnectedAsync()
    {
        var usuario = await userManager.Users.Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Id == Context.UserIdentifier);
        if (usuario is null || !usuario.Ativo || usuario.Empresa is { Ativa: false })
        {
            Context.Abort();
            return;
        }

        // O dono do sistema não é de nenhuma empresa: recebe só o que vai para todos
        if (usuario.EmpresaId is long empresaId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GrupoDaEmpresa(empresaId));
        }

        await base.OnConnectedAsync();
    }
}
