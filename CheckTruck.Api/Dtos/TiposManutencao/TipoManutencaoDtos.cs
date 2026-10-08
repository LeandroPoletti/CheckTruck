using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;

namespace CheckTruck.Api.Dtos.TiposManutencao;

public class TipoManutencaoRequestDto
{
    [Required(ErrorMessage = "Informe o nome.")]
    [MaxLength(100, ErrorMessage = "O nome pode ter até 100 caracteres.")]
    public string Nome { get; set; }

    public string? Descricao { get; set; }

    /// <summary>Componente do caminhão: define o padrão seguro quando não há intervalo cadastrado.</summary>
    public Componente Componente { get; set; }
}

public class TipoManutencaoResponseDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public Componente Componente { get; set; }
}

public static class TipoManutencaoDtoExtensions
{
    public static TipoManutencaoResponseDto ToResponseDto(this TipoManutencao entidade) => new()
    {
        Id = entidade.Id,
        Nome = entidade.Nome,
        Descricao = entidade.Descricao,
        Componente = entidade.Componente
    };

    public static TipoManutencao ToEntity(this TipoManutencaoRequestDto dto) => new()
    {
        Nome = dto.Nome,
        Descricao = dto.Descricao?.Trim() ?? "",
        Componente = dto.Componente
    };
}
