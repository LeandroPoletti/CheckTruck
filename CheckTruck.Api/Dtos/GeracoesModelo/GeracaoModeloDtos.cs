using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.GeracoesModelo;

public class GeracaoModeloRequestDto
{
    [Required]
    public string Nome { get; set; }

    [Required]
    public long FabricanteId { get; set; }

    public string Motor { get; set; }
    public string NormaEmissao { get; set; }
    public string Caixa { get; set; }
    public DateTime AnoInicio { get; set; }
    public DateTime? AnoFim { get; set; }
}

public class GeracaoModeloResponseDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public FabricanteResumoDto Fabricante { get; set; }
    public string Motor { get; set; }
    public string NormaEmissao { get; set; }
    public string Caixa { get; set; }
    public DateTime AnoInicio { get; set; }
    public DateTime? AnoFim { get; set; }
}

public static class GeracaoModeloDtoExtensions
{
    public static GeracaoModeloResponseDto ToResponseDto(this GeracaoModelo entidade) => new()
    {
        Id = entidade.Id,
        Nome = entidade.Nome,
        Fabricante = entidade.Fabricante?.ToResumoDto(),
        Motor = entidade.Motor,
        NormaEmissao = entidade.NormaEmissao,
        Caixa = entidade.Caixa,
        AnoInicio = entidade.AnoInicio,
        AnoFim = entidade.AnoFim
    };

    public static GeracaoModelo ToEntity(this GeracaoModeloRequestDto dto, Fabricante fabricante) => new()
    {
        Nome = dto.Nome,
        Fabricante = fabricante,
        Motor = dto.Motor,
        NormaEmissao = dto.NormaEmissao,
        Caixa = dto.Caixa,
        AnoInicio = dto.AnoInicio,
        AnoFim = dto.AnoFim
    };
}
