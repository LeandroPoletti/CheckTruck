using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class Veiculo : EntidadeBanco
{
    public long Id { get; set; }
    public string Placa { get; set; }
    public Modelo Modelo { get; set; }
    [StringLength(17, MinimumLength = 17), Required]
    public string Chassi { get; set; }
    public string Renavam { get; set; }
    public DateTime AnoModelo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }
    public string MotoristaGuid { get; set; }
    public IList<Manutencao> Manutencoes { get; set; } = new List<Manutencao>();
}