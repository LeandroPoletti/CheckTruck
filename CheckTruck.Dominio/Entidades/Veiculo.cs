using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class Veiculo : EntidadeDaEmpresa, EntidadeComVersao
{
    public long Id { get; set; }
    public uint Versao { get; set; }
    public string Placa { get; set; } = "";
    /// <summary>Potência do caminhão. Por ela se chega à geração, ao modelo e ao fabricante.</summary>
    public Potencia Potencia { get; set; } = null!;
    public Tracao Tracao { get; set; }
    [StringLength(17, MinimumLength = 17), Required]
    public string Chassi { get; set; } = "";
    /// <summary>Opcional; quando tem, são 11 números.</summary>
    public string? Renavam { get; set; }
    public DateTime AnoModelo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }
    /// <summary>Motorista que está com o caminhão agora (acesso com cargo Motorista). Opcional.</summary>
    public Usuario? MotoristaAtual { get; set; }
    public IList<OrdemServico> OrdensServico { get; set; } = new List<OrdemServico>();
    /// <summary>Toda mudança de km: quem, quando, de quanto pra quanto e por quê.</summary>
    public IList<RegistroKm> RegistrosKm { get; set; } = new List<RegistroKm>();
}
