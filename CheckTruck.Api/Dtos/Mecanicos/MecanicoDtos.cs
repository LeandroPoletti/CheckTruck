using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Mecanicos;

public class MecanicoRequestDto
{
    [Required(ErrorMessage = "Informe o nome do mecânico.")]
    [MaxLength(150, ErrorMessage = "O nome pode ter até 150 caracteres.")]
    public string Nome { get; set; }

    /// <summary>Função na oficina (ex.: mecânico, borracheiro, eletricista).</summary>
    [Required(ErrorMessage = "Informe a função.")]
    [MaxLength(100, ErrorMessage = "A função pode ter até 100 caracteres.")]
    public string Funcao { get; set; }

    public bool Ativo { get; set; } = true;
}

public class MecanicoResponseDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public string Funcao { get; set; }
    public bool Ativo { get; set; }
}

public static class MecanicoDtoExtensions
{
    public static MecanicoResponseDto ToResponseDto(this Mecanico entidade) => new()
    {
        Id = entidade.Id,
        Nome = entidade.Nome,
        Funcao = entidade.Funcao,
        Ativo = entidade.Ativo
    };

    public static Mecanico ToEntity(this MecanicoRequestDto dto) => new()
    {
        Nome = dto.Nome.Trim(),
        Funcao = dto.Funcao.Trim(),
        Ativo = dto.Ativo
    };
}
