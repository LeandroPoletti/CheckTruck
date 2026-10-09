using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;

namespace CheckTruck.Api.Dtos.Veiculos;

/// <summary>Correção de km feita por Admin ou Gestor (ex.: alguém digitou um zero a mais).</summary>
public class CorrecaoKmRequestDto
{
    [Range(0, int.MaxValue, ErrorMessage = "O km do caminhão não pode ser negativo.")]
    public int Km { get; set; }

    [Required(ErrorMessage = "Informe o motivo da correção (ex.: zero a mais).")]
    [MaxLength(200, ErrorMessage = "O motivo pode ter até 200 caracteres.")]
    public string Motivo { get; set; } = "";
}

/// <summary>Uma mudança no km do caminhão: de quanto pra quanto, o que mudou, quem e quando.</summary>
public class RegistroKmResponseDto
{
    public long Id { get; set; }

    /// <summary>Km antes da mudança; null no cadastro do caminhão.</summary>
    public int? KmAnterior { get; set; }
    public int KmNovo { get; set; }

    /// <summary>Cadastro, AtualizarKm, OrdemServico, Edicao ou Correcao.</summary>
    public OrigemKm Origem { get; set; }
    public string? Motivo { get; set; }

    /// <summary>Número da OS que subiu o km; null se não foi OS ou se a OS foi excluída.</summary>
    public long? OrdemServicoId { get; set; }
    public UsuarioResumoDto? RegistradoPor { get; set; }
    public DateTime RegistradoEm { get; set; }
}

public static class RegistroKmDtoExtensions
{
    public static readonly Expression<Func<RegistroKm, RegistroKmResponseDto>> Projecao = r => new RegistroKmResponseDto
    {
        Id = r.Id,
        KmAnterior = r.KmAnterior,
        KmNovo = r.KmNovo,
        Origem = r.Origem,
        Motivo = r.Motivo,
        OrdemServicoId = r.OrdemServico == null ? null : r.OrdemServico.Id,
        RegistradoPor = r.RegistradoPor == null ? null : new UsuarioResumoDto { Id = r.RegistradoPor.Id, Nome = r.RegistradoPor.Nome },
        RegistradoEm = r.RegistradoEm
    };
}
