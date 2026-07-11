using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Attributes;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

public class Tecnico : EntidadeBanco
{
    public long Id { get; set; }
    public string UsuarioGuid { get; set; } = null!;
    [Required,Cpf]
    public string Cpf { get; set; }
    public IList<Manutencao> Manutencoes { get; set; } = new List<Manutencao>();
}
