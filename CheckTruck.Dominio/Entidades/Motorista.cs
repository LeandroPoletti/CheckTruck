using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class Motorista : EntidadeBanco
{
    public long Id { get; set; }
    public string UsuarioGuid { get; set; } = null!;
    public Veiculo? Veiculo { get; set; }
}
