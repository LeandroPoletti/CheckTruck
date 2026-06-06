using CheckTruck.Dominio.Entidades;
using Microsoft.AspNetCore.Identity;

namespace CheckTruck.Repositorio.Entidades;

public class Usuario : IdentityUser
{
    public bool Ativo { get; set; }
    public Veiculo Veiculo { get; set; } 
    public IList<Manutencao> Manutencoes { get; set; } = new List<Manutencao>();
}