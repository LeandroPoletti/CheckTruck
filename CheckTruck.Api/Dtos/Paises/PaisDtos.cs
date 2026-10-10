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

    /// <summary>Do catálogo do sistema (só o dono do sistema muda). false = da empresa de quem está logado.</summary>
    public bool DoSistema { get; set; }

    public string Nome { get; set; }
}

public static class PaisDtoExtensions
{
    public static PaisResponseDto ToResponseDto(this Pais entidade) => new()
    {
        Id = entidade.Id,
        DoSistema = entidade.EmpresaId is null,
        Nome = entidade.Nome
    };

    public static Pais ToEntity(this PaisRequestDto dto) => new()
    {
        Nome = dto.Nome
    };
}
