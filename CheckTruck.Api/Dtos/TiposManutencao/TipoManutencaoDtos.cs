using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;

namespace CheckTruck.Api.Dtos.TiposManutencao;

public class TipoManutencaoRequestDto
{
    [Required]
    public string Nome { get; set; }

    public string Descricao { get; set; }
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
        Descricao = dto.Descricao,
        Componente = dto.Componente
    };
}
