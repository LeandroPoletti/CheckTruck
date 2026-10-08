using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Modelos;

public class ModeloRequestDto
{
    [Required(ErrorMessage = "Informe o nome do modelo.")]
    [MaxLength(100, ErrorMessage = "O nome pode ter até 100 caracteres.")]
    public string Nome { get; set; }

    [Required]
    public long FabricanteId { get; set; }
}

public class ModeloResponseDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public FabricanteResumoDto Fabricante { get; set; }
}

public static class ModeloDtoExtensions
{
    public static ModeloResponseDto ToResponseDto(this Modelo entidade) => new()
    {
        Id = entidade.Id,
        Nome = entidade.Nome,
        Fabricante = entidade.Fabricante?.ToResumoDto()
    };

    public static Modelo ToEntity(this ModeloRequestDto dto, Fabricante fabricante) => new()
    {
        Nome = dto.Nome.Trim(),
        Fabricante = fabricante
    };
}
