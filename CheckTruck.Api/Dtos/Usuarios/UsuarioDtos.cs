using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Attributes;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Servicos;
using CheckTruck.Dominio.Util;

namespace CheckTruck.Api.Dtos.Usuarios;

public class UsuarioRequestDto
{
    [Required(ErrorMessage = "Informe o nome.")]
    [StringLength(150)]
    public string Nome { get; set; } = "";

    [Required(ErrorMessage = "Informe o e-mail.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string Email { get; set; } = "";

    /// <summary>Com ou sem máscara. Obrigatório para todos, menos o admin do sistema.</summary>
    [Cpf]
    public string? Cpf { get; set; }

    [Required(ErrorMessage = "Escolha o cargo.")]
    public Cargo? Cargo { get; set; }

    /// <summary>Ignorado para Admin e Gestor: eles podem tudo.</summary>
    public List<Permissao> Permissoes { get; set; } = new();

    /// <summary>Obrigatória ao criar. Ao editar, em branco mantém a senha atual.</summary>
    public string? Senha { get; set; }
}

public class UsuarioResponseDto
{
    public string Id { get; set; } = "";
    public string Nome { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Cpf { get; set; }
    public Cargo Cargo { get; set; }

    /// <summary>O que a pessoa pode fazer. Para Admin e Gestor vêm todas.</summary>
    public List<Permissao> Permissoes { get; set; } = new();

    /// <summary>Admin ou Gestor: podem tudo e cuidam dos acessos.</summary>
    public bool CuidaDosAcessos { get; set; }

    /// <summary>Admin criado pelo sistema (não muda e-mail nem cargo e não pode ser desativado).</summary>
    public bool AdminDoSistema { get; set; }

    public bool Ativo { get; set; }
}

public static class UsuarioDtoExtensions
{
    public static UsuarioResponseDto ToResponseDto(this Usuario entidade) => new()
    {
        Id = entidade.Id,
        Nome = entidade.Nome,
        Email = entidade.Email ?? "",
        Cpf = entidade.Cpf,
        Cargo = entidade.Cargo,
        Permissoes = PermissaoUtil.ParaLista(entidade.PermissoesEfetivas),
        CuidaDosAcessos = entidade.CuidaDosAcessos,
        AdminDoSistema = ServicoUsuario.EhAdminDoSistema(entidade),
        Ativo = entidade.Ativo
    };

    // Os dados vão num Usuario solto: o serviço confere e copia para o acesso de verdade
    public static Usuario ToEntity(this UsuarioRequestDto dto) => new()
    {
        Nome = dto.Nome,
        Email = dto.Email,
        Cpf = dto.Cpf,
        Cargo = dto.Cargo!.Value,
        Permissoes = PermissaoUtil.Juntar(dto.Permissoes)
    };
}
