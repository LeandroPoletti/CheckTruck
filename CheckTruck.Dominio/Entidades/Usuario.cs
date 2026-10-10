using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Util;
using Microsoft.AspNetCore.Identity;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Quem entra no sistema (o login é o e-mail). O cargo diz quem a pessoa é e as permissões dizem
/// o que ela pode fazer. Admin e Gestor podem tudo e são os únicos que cuidam dos acessos.
/// </summary>
public class Usuario : IdentityUser
{
    public string Nome { get; set; } = "";

    /// <summary>
    /// Empresa da pessoa: ela só vê e mexe nos dados dessa empresa. O e-mail (login) não repete em nenhuma.
    /// Só o dono do sistema fica sem empresa (null).
    /// </summary>
    public long? EmpresaId { get; set; }

    /// <summary>Só vem preenchida ao criar a conta: a empresa nova é gravada junto com o primeiro acesso.</summary>
    public Empresa? Empresa { get; set; }

    /// <summary>Só números. Obrigatório para todos, menos o admin e o dono do sistema (criados pelo sistema).</summary>
    public string? Cpf { get; set; }

    public Cargo Cargo { get; set; }

    /// <summary>Permissões liberadas pelo admin ou gestor. Para Admin e Gestor fica vazio: eles já podem tudo.</summary>
    public Permissao Permissoes { get; set; }

    /// <summary>Inativo não entra no sistema.</summary>
    public bool Ativo { get; set; }

    public bool CuidaDosAcessos => Cargo is Cargo.Admin or Cargo.Gestor;

    public Permissao PermissoesEfetivas => CuidaDosAcessos ? PermissaoUtil.Todas : Permissoes;

    public bool Pode(Permissao permissao) => Ativo && (PermissoesEfetivas & permissao) == permissao;
}
