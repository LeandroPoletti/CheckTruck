using System.ComponentModel.DataAnnotations;

namespace CheckTruck.Dominio.Entidades;

public class Veiculo
{
    public long Id { get; set; }
    public string Placa { get; set; }
    public Modelo Modelo { get; set; }
    [Length(17,17), Required]
    public string Chassi { get; set; }
    public string Renavam { get; set; }
    public DateTime AnoModelo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }
    public Usuario Motorista { get; set; }
}