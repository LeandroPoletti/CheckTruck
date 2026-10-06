using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.IntervalosVeiculo;

public class IntervaloVeiculoRequestDto
{
    [Required]
    public long VeiculoId { get; set; }

    [Required]
    public long TipoManutencaoId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "O intervalo em km precisa ser maior que zero.")]
    public int IntervaloKm { get; set; }

    /// <summary>Prazo máximo entre trocas, em meses. 0 = vence só por km.</summary>
    [Range(0, 120)]
    public int IntervaloMeses { get; set; }

    public string? Observacao { get; set; }
}

public class IntervaloVeiculoResponseDto
{
    public long Id { get; set; }
    public VeiculoResumoDto Veiculo { get; set; }
    public TipoManutencaoResumoDto TipoManutencao { get; set; }
    public int IntervaloKm { get; set; }
    public int IntervaloMeses { get; set; }
    public string? Observacao { get; set; }
}

public static class IntervaloVeiculoDtoExtensions
{
    public static IntervaloVeiculoResponseDto ToResponseDto(this IntervaloVeiculo entidade) => new()
    {
        Id = entidade.Id,
        Veiculo = entidade.Veiculo?.ToResumoDto(),
        TipoManutencao = entidade.TipoManutencao?.ToResumoDto(),
        IntervaloKm = entidade.IntervaloKm,
        IntervaloMeses = entidade.IntervaloMeses,
        Observacao = entidade.Observacao
    };

    public static IntervaloVeiculo ToEntity(this IntervaloVeiculoRequestDto dto, Veiculo veiculo, TipoManutencao tipoManutencao) => new()
    {
        Veiculo = veiculo,
        TipoManutencao = tipoManutencao,
        IntervaloKm = dto.IntervaloKm,
        IntervaloMeses = dto.IntervaloMeses,
        Observacao = dto.Observacao
    };
}
