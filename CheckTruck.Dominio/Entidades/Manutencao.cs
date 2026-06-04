using System.ComponentModel.DataAnnotations;

namespace CheckTruck.Dominio.Entidades;

public class Manutencao
{
    public long Id { get; set; }
    public Veiculo Veiculo { get; set; }
    public TipoManutencao TipoManutencao { get; set; }
    public Usuario Usuario { get; set; }
    public DateTime RealizadoEm { get; set; } = DateTime.Now;
    public DateTime? DataProximaTroca { get; set; }
    public int KmAtual { get; set; }
    public int KmProximaTroca { get; set; }
    public bool IsPrimeiraTroca { get; set; }
    [Required]
    public string NumNotaFiscal { get; set; }
    public string Observacao { get; set; }
    [Required]
    public string Concessionaria { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.Now;
    public DateTime? AtualizadoEm { get; set; }
}