using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Paises;

public class PaisRequestDto
{
    [Required]
    public string Nome { get; set; }
}

public class PaisResponseDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
}

public static class PaisDtoExtensions
{
    public static PaisResponseDto ToResponseDto(this Pais entidade) => new()
    {
        Id = entidade.Id,
        Nome = entidade.Nome
    };

    public static Pais ToEntity(this PaisRequestDto dto) => new()
    {
        Nome = dto.Nome
    };
}
