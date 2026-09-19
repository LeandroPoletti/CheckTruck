using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Attributes;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Motoristas;

public class MotoristaRequestDto
{
    [Required]
    public string UsuarioGuid { get; set; }

    [Required, Cpf]
    public string Cpf { get; set; }
}

public class MotoristaResponseDto
{
    public long Id { get; set; }
    public string UsuarioGuid { get; set; }
    public string Cpf { get; set; }
    public VeiculoResumoDto Veiculo { get; set; }
}

public static class MotoristaDtoExtensions
{
    public static MotoristaResponseDto ToResponseDto(this Motorista entidade) => new()
    {
        Id = entidade.Id,
        UsuarioGuid = entidade.UsuarioGuid,
        Cpf = entidade.Cpf,
        Veiculo = entidade.Veiculo?.ToResumoDto()
    };

    public static Motorista ToEntity(this MotoristaRequestDto dto) => new()
    {
        UsuarioGuid = dto.UsuarioGuid,
        Cpf = dto.Cpf
    };
}
