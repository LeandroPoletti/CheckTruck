using CheckTruck.Dominio.Entidades;
using Microsoft.AspNetCore.Identity;

namespace CheckTruck.Repositorio.Entidades;

public class Usuario : IdentityUser
{
    public bool Ativo { get; set; }
    public Motorista? Motorista { get; set; }
    public Tecnico? Tecnico { get; set; }
}
