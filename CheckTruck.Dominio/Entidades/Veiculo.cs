using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class Veiculo : EntidadeBanco
{
    public long Id { get; set; }
    public string Placa { get; set; }
    /// <summary>Potência do caminhão. Por ela se chega à geração, ao modelo e ao fabricante.</summary>
    public Potencia Potencia { get; set; }
    public Tracao Tracao { get; set; }
    [StringLength(17, MinimumLength = 17), Required]
    public string Chassi { get; set; }
    public string Renavam { get; set; }
    public DateTime AnoModelo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }
    /// <summary>Motorista que está com o caminhão agora (acesso com cargo Motorista). Opcional.</summary>
    public Usuario? MotoristaAtual { get; set; }
    public IList<Manutencao> Manutencoes { get; set; } = new List<Manutencao>();
}
