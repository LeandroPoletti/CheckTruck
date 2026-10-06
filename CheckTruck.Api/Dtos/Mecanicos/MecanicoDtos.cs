using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Mecanicos;

public class MecanicoRequestDto
{
    [Required(ErrorMessage = "Informe o nome do mecânico.")]
    [StringLength(150)]
    public string Nome { get; set; }

    /// <summary>Função na oficina (ex.: mecânico, borracheiro, eletricista).</summary>
    [Required(ErrorMessage = "Informe a função.")]
    [StringLength(100)]
    public string Funcao { get; set; }

    public bool Ativo { get; set; } = true;
}

public class MecanicoResponseDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public string Funcao { get; set; }
    public bool Ativo { get; set; }

    /// <summary>true quando o mecânico tem login para consultar pelo celular.</summary>
    public bool TemAcesso { get; set; }
}

/// <summary>Login do mecânico: e-mail (vira o usuário) e senha.</summary>
public class AcessoMecanicoRequestDto
{
    [Required(ErrorMessage = "Informe o e-mail.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Informe a senha.")]
    [MinLength(6, ErrorMessage = "A senha precisa ter pelo menos 6 caracteres.")]
    public string Senha { get; set; }
}

public static class MecanicoDtoExtensions
{
    public static MecanicoResponseDto ToResponseDto(this Mecanico entidade) => new()
    {
        Id = entidade.Id,
        Nome = entidade.Nome,
        Funcao = entidade.Funcao,
        Ativo = entidade.Ativo,
        TemAcesso = entidade.UsuarioGuid != null
    };

    public static Mecanico ToEntity(this MecanicoRequestDto dto) => new()
    {
        Nome = dto.Nome.Trim(),
        Funcao = dto.Funcao.Trim(),
        Ativo = dto.Ativo
    };
}
