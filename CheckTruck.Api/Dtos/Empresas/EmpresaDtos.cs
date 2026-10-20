using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Empresas;

/// <summary>Dados da empresa de quem está logado (tela Minha empresa).</summary>
public class EmpresaResponseDto
{
    public string Nome { get; set; } = "";

    /// <summary>Sem máscara: o CNPJ (nas contas antigas de uma pessoa só, o CPF). null na empresa do TCC.</summary>
    public string? Documento { get; set; }
}

/// <summary>Empresa nova, cadastrada pelo dono do sistema, com o Admin dela (o login do dono da empresa).</summary>
public class NovaEmpresaRequestDto
{
    [Required(ErrorMessage = "Informe o nome da empresa.")]
    [MaxLength(150, ErrorMessage = "O nome da empresa pode ter até 150 caracteres.")]
    public string NomeEmpresa { get; set; } = "";

    /// <summary>Com ou sem máscara; aceita o CNPJ com letras.</summary>
    [Required(ErrorMessage = "Informe o CNPJ.")]
    public string Cnpj { get; set; } = "";

    [Required(ErrorMessage = "Informe o nome do admin.")]
    [MaxLength(150, ErrorMessage = "O nome pode ter até 150 caracteres.")]
    public string Nome { get; set; } = "";

    /// <summary>Com ou sem máscara.</summary>
    [Required(ErrorMessage = "Informe o CPF.")]
    public string Cpf { get; set; } = "";

    [Required(ErrorMessage = "Informe o e-mail.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Informe a senha.")]
    public string Senha { get; set; } = "";
}

/// <summary>Senha nova que o dono do sistema define para o Admin de uma empresa.</summary>
public class NovaSenhaRequestDto
{
    [Required(ErrorMessage = "Informe a senha.")]
    public string Senha { get; set; } = "";
}

/// <summary>Empresa na tela Empresas do dono do sistema.</summary>
public class EmpresaDoSistemaResponseDto
{
    public long Id { get; set; }
    public string Nome { get; set; } = "";

    /// <summary>CNPJ sem máscara. null na empresa do TCC.</summary>
    public string? Documento { get; set; }

    public bool Ativa { get; set; }

    /// <summary>Quando foi desativada (null se está ativa).</summary>
    public DateTime? DesativadaEm { get; set; }

    public List<AdminDaEmpresaDto> Admins { get; set; } = new();
}

/// <summary>Admin de uma empresa: o login que o dono do sistema passou (e para quem ele pode definir senha nova).</summary>
public class AdminDaEmpresaDto
{
    public string Id { get; set; } = "";
    public string Nome { get; set; } = "";
    public string Email { get; set; } = "";
    public bool Ativo { get; set; }
}

public static class EmpresaDtoExtensions
{
    public static EmpresaResponseDto ToResponseDto(this Empresa entidade) => new()
    {
        Nome = entidade.Nome,
        Documento = entidade.Documento
    };

    public static EmpresaDoSistemaResponseDto ToDoSistemaResponseDto(this Empresa entidade, IEnumerable<Usuario> admins) => new()
    {
        Id = entidade.Id,
        Nome = entidade.Nome,
        Documento = entidade.Documento,
        Ativa = entidade.Ativa,
        DesativadaEm = entidade.DesativadaEm,
        Admins = admins.Select(u => new AdminDaEmpresaDto { Id = u.Id, Nome = u.Nome, Email = u.Email ?? "", Ativo = u.Ativo }).ToList()
    };
}
