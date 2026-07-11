using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Attributes;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class Motorista : EntidadeBanco
{
    public long Id { get; set; }
    public string UsuarioGuid { get; set; } = null!;
    [Required, Cpf]
    public string Cpf { get; set; }
    public Veiculo? Veiculo { get; set; }
}
