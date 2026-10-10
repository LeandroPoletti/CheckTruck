using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;

namespace CheckTruck.Api.Dtos.Geracoes;

public class GeracaoRequestDto
{
    [Required(ErrorMessage = "Informe o nome da geração.")]
    [MaxLength(100, ErrorMessage = "O nome pode ter até 100 caracteres.")]
    public string Nome { get; set; }

    [Required]
    public long ModeloId { get; set; }

    /// <summary>Primeiro ano-modelo vendido no Brasil.</summary>
    public int AnoInicio { get; set; }

    /// <summary>Último ano-modelo; vazio = ainda é vendida.</summary>
    public int? AnoFim { get; set; }

    public NormaEmissao NormaEmissao { get; set; }

    [MaxLength(100, ErrorMessage = "O motor pode ter até 100 caracteres.")]
    public string? Motor { get; set; }

    [MaxLength(100, ErrorMessage = "O câmbio pode ter até 100 caracteres.")]
    public string? Caixa { get; set; }

    /// <summary>Potências (cv) em que a geração foi vendida. Ao salvar, entram as novas e saem as que não vieram.</summary>
    public List<int> Potencias { get; set; } = new();
}

public class GeracaoResponseDto
{
    public long Id { get; set; }

    /// <summary>Do catálogo do sistema (só o dono do sistema muda). false = da empresa de quem está logado.</summary>
    public bool DoSistema { get; set; }

    public string Nome { get; set; }
    public ModeloResumoDto Modelo { get; set; }
    public FabricanteResumoDto Fabricante { get; set; }
    public int AnoInicio { get; set; }
    public int? AnoFim { get; set; }
    public NormaEmissao NormaEmissao { get; set; }
    public string? Motor { get; set; }
    public string? Caixa { get; set; }

    /// <summary>Da menor para a maior.</summary>
    public IList<PotenciaResumoDto> Potencias { get; set; }
}

public static class GeracaoDtoExtensions
{
    public static GeracaoResponseDto ToResponseDto(this Geracao entidade) => new()
    {
        Id = entidade.Id,
        DoSistema = entidade.EmpresaId is null,
        Nome = entidade.Nome,
        Modelo = entidade.Modelo?.ToResumoDto(),
        Fabricante = entidade.Modelo?.Fabricante?.ToResumoDto(),
        AnoInicio = entidade.AnoInicio,
        AnoFim = entidade.AnoFim,
        NormaEmissao = entidade.NormaEmissao,
        Motor = entidade.Motor,
        Caixa = entidade.Caixa,
        Potencias = entidade.Potencias.OrderBy(p => p.Cv).Select(p => p.ToResumoDto()).ToList()
    };

    public static Geracao ToEntity(this GeracaoRequestDto dto, Modelo modelo) => new()
    {
        Nome = dto.Nome,
        Modelo = modelo,
        AnoInicio = dto.AnoInicio,
        AnoFim = dto.AnoFim,
        NormaEmissao = dto.NormaEmissao,
        Motor = string.IsNullOrWhiteSpace(dto.Motor) ? null : dto.Motor.Trim(),
        Caixa = string.IsNullOrWhiteSpace(dto.Caixa) ? null : dto.Caixa.Trim(),
        Potencias = dto.Potencias.Select(cv => new Potencia { Cv = cv }).ToList()
    };
}
