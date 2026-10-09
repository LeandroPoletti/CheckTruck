using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Ordem de serviço lançada no sistema: o que foi trocado, por qual mecânico, com qual motorista e quem lançou.
/// </summary>
public class Manutencao : EntidadeDaEmpresa
{
    /// <summary>Número da OS: o banco gera em sequência.</summary>
    public long Id { get; set; }
    public Veiculo Veiculo { get; set; }
    public TipoManutencao TipoManutencao { get; set; }
    public DateTime RealizadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? DataProximaTroca { get; set; }
    public int KmAtual { get; set; }
    public int KmProximaTroca { get; set; }
    public bool IsPrimeiraTroca { get; set; }
    /// <summary>Mecânico que fez a troca (escolhido no cadastro de mecânicos).</summary>
    [Required]
    public Mecanico Mecanico { get; set; } = null!;
    /// <summary>Motorista que estava com o caminhão (opcional). Ao lançar a OS, ele vira o motorista atual do caminhão.</summary>
    public Usuario? Motorista { get; set; }
    public string? Observacao { get; set; }
    public string? Concessionaria { get; set; }
    /// <summary>Quem lançou a OS: a API preenche com quem está logado. OS antigas podem estar sem.</summary>
    public Usuario? LancadoPor { get; set; }
    /// <summary>Data e hora em que a OS foi lançada no sistema.</summary>
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }
}
