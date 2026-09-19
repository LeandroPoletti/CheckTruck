using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Attributes;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Tecnicos;

public class TecnicoRequestDto
{
    [Required]
    public string UsuarioGuid { get; set; }

    [Required, Cpf]
    public string Cpf { get; set; }
}

public class TecnicoResponseDto
{
    public long Id { get; set; }
    public string UsuarioGuid { get; set; }
    public string Cpf { get; set; }
}

public static class TecnicoDtoExtensions
{
    public static TecnicoResponseDto ToResponseDto(this Tecnico entidade) => new()
    {
        Id = entidade.Id,
        UsuarioGuid = entidade.UsuarioGuid,
        Cpf = entidade.Cpf
    };

    public static Tecnico ToEntity(this TecnicoRequestDto dto) => new()
    {
        UsuarioGuid = dto.UsuarioGuid,
        Cpf = dto.Cpf
    };
}
