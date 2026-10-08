using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.IntervalosRecomendados;

public class IntervaloRecomendadoRequestDto
{
    [Required]
    public long GeracaoId { get; set; }

    [Required]
    public long TipoManutencaoId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Informe o intervalo em km.")]
    public int IntervaloKm { get; set; }

    /// <summary>Km da 1ª troca (amaciamento). 0 = igual ao intervalo.</summary>
    [Range(0, int.MaxValue, ErrorMessage = "O km da 1ª troca não pode ser negativo.")]
    public int IntervaloKmPrimeira { get; set; }

    /// <summary>Prazo máximo entre trocas, em meses. 0 = vence só por km.</summary>
    [Range(0, 120, ErrorMessage = "O prazo vai de 0 a 120 meses (0 = só por km).")]
    public int IntervaloMeses { get; set; }

    public string? Fonte { get; set; }
    public string? Observacao { get; set; }
}

public class IntervaloRecomendadoResponseDto
{
    public long Id { get; set; }
    public GeracaoResumoDto Geracao { get; set; }
    public TipoManutencaoResumoDto TipoManutencao { get; set; }
    public int IntervaloKm { get; set; }
    public int IntervaloKmPrimeira { get; set; }
    public int IntervaloMeses { get; set; }
    public string Fonte { get; set; }
    public string Observacao { get; set; }
}

/// <summary>Padrão seguro do sistema para um tipo de manutenção (vale sem intervalo do caminhão nem da geração).</summary>
public class IntervaloPadraoResponseDto
{
    public long TipoManutencaoId { get; set; }
    public int IntervaloKm { get; set; }

    /// <summary>Prazo máximo entre trocas, em meses.</summary>
    public int IntervaloMeses { get; set; }
}

public static class IntervaloRecomendadoDtoExtensions
{
    public static IntervaloRecomendadoResponseDto ToResponseDto(this IntervaloRecomendado entidade) => new()
    {
        Id = entidade.Id,
        Geracao = entidade.Geracao?.ToResumoDto(),
        TipoManutencao = entidade.TipoManutencao?.ToResumoDto(),
        IntervaloKm = entidade.IntervaloKm,
        IntervaloKmPrimeira = entidade.IntervaloKmPrimeira,
        IntervaloMeses = entidade.IntervaloMeses,
        Fonte = entidade.Fonte,
        Observacao = entidade.Observacao
    };

    public static IntervaloRecomendado ToEntity(this IntervaloRecomendadoRequestDto dto, Geracao geracao, TipoManutencao tipoManutencao) => new()
    {
        Geracao = geracao,
        TipoManutencao = tipoManutencao,
        IntervaloKm = dto.IntervaloKm,
        IntervaloKmPrimeira = dto.IntervaloKmPrimeira,
        IntervaloMeses = dto.IntervaloMeses,
        Fonte = dto.Fonte?.Trim() ?? "",
        Observacao = dto.Observacao?.Trim() ?? ""
    };
}
