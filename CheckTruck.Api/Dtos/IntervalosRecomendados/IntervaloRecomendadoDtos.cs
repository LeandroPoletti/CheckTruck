using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.IntervalosRecomendados;

public class IntervaloRecomendadoRequestDto
{
    [Required]
    public long ModeloId { get; set; }

    [Required]
    public long TipoManutencaoId { get; set; }

    public int IntervaloKm { get; set; }
    public int IntervaloKmPrimeira { get; set; }
    public string Fonte { get; set; }
    public string Observacao { get; set; }
}

public class IntervaloRecomendadoResponseDto
{
    public long Id { get; set; }
    public ModeloResumoDto Modelo { get; set; }
    public TipoManutencaoResumoDto TipoManutencao { get; set; }
    public int IntervaloKm { get; set; }
    public int IntervaloKmPrimeira { get; set; }
    public string Fonte { get; set; }
    public string Observacao { get; set; }
}

public static class IntervaloRecomendadoDtoExtensions
{
    public static IntervaloRecomendadoResponseDto ToResponseDto(this IntervaloRecomendado entidade) => new()
    {
        Id = entidade.Id,
        Modelo = entidade.Modelo?.ToResumoDto(),
        TipoManutencao = entidade.TipoManutencao?.ToResumoDto(),
        IntervaloKm = entidade.IntervaloKm,
        IntervaloKmPrimeira = entidade.IntervaloKmPrimeira,
        Fonte = entidade.Fonte,
        Observacao = entidade.Observacao
    };

    public static IntervaloRecomendado ToEntity(this IntervaloRecomendadoRequestDto dto, Modelo modelo, TipoManutencao tipoManutencao) => new()
    {
        Modelo = modelo,
        TipoManutencao = tipoManutencao,
        IntervaloKm = dto.IntervaloKm,
        IntervaloKmPrimeira = dto.IntervaloKmPrimeira,
        Fonte = dto.Fonte,
        Observacao = dto.Observacao
    };
}
