using CheckTruck.Dominio.Entidades;
using Microsoft.AspNetCore.Identity;

namespace CheckTruck.Api.Acesso;

/// <summary>
/// No login o Identity pergunta aqui se a conta pode entrar (porque RequireConfirmedAccount está ligado
/// no Program.cs). No CheckTruck a regra é uma só: acesso inativo não entra.
/// </summary>
public class ConfirmacaoUsuarioAtivo : IUserConfirmation<Usuario>
{
    public Task<bool> IsConfirmedAsync(UserManager<Usuario> manager, Usuario user) => Task.FromResult(user.Ativo);
}
