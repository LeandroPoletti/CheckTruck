using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Ordem de serviço lançada no sistema: o que foi trocado, por qual mecânico, e quem lançou.
/// </summary>
public class Manutencao : EntidadeBanco
{
    public long Id { get; set; }
    public Veiculo Veiculo { get; set; }
    public TipoManutencao TipoManutencao { get; set; }
    public DateTime RealizadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? DataProximaTroca { get; set; }
    public int KmAtual { get; set; }
    public int KmProximaTroca { get; set; }
    public bool IsPrimeiraTroca { get; set; }
    /// <summary>Número da OS ou da nota fiscal.</summary>
    [Required]
    public string NumNotaFiscal { get; set; }
    /// <summary>Mecânico que fez a troca (escolhido no cadastro de mecânicos).</summary>
    [Required]
    public Mecanico Mecanico { get; set; } = null!;
    public string? Observacao { get; set; }
    public string? Concessionaria { get; set; }
    /// <summary>Login de quem lançou a OS no sistema. Preenchido pela API a partir do token.</summary>
    public string LancadoPor { get; set; } = "";
    /// <summary>Data e hora em que a OS foi lançada no sistema.</summary>
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }
}
