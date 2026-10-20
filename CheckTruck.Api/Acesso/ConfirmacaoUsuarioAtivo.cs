using CheckTruck.Dominio.Entidades;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CheckTruck.Api.Acesso;

/// <summary>
/// No login (e na renovação do login) o Identity pergunta aqui se a conta pode entrar, porque
/// RequireConfirmedAccount está ligado no Program.cs. Não entra o acesso inativo nem quem é de uma empresa
/// desativada pelo dono do sistema.
/// </summary>
public class ConfirmacaoUsuarioAtivo : IUserConfirmation<Usuario>
{
    public async Task<bool> IsConfirmedAsync(UserManager<Usuario> manager, Usuario user) =>
        user.Ativo
        && await manager.Users.AnyAsync(u => u.Id == user.Id && (u.Empresa == null || u.Empresa.DesativadaEm == null));
}
