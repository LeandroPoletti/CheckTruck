using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Uma mudança no km do caminhão: de quanto pra quanto, o que mudou, quem e quando.
/// Serve para achar e corrigir km digitado errado (ex.: um zero a mais).
/// </summary>
public class RegistroKm : EntidadeDaEmpresa
{
    public long Id { get; set; }
    [Required]
    public Veiculo Veiculo { get; set; } = null!;
    /// <summary>Km antes da mudança; null no cadastro do caminhão.</summary>
    public int? KmAnterior { get; set; }
    public int KmNovo { get; set; }
    public OrigemKm Origem { get; set; }
    /// <summary>Por que mudou. Obrigatório na correção.</summary>
    public string? Motivo { get; set; }
    /// <summary>OS que subiu o km. Fica null se a OS for excluída.</summary>
    public Manutencao? OrdemServico { get; set; }
    /// <summary>Quem estava logado quando o km mudou.</summary>
    public Usuario? RegistradoPor { get; set; }
    public DateTime RegistradoEm { get; set; } = DateTime.UtcNow;
}
