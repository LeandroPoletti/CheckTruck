using System.ComponentModel.DataAnnotations;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Mecânico que faz as trocas (ex.: "Marco Rueda" / "Borracheiro"). Cadastro simples, sem login.
/// Na OS, o mecânico é escolhido desta lista.
/// </summary>
public class Mecanico : EntidadeBanco
{
    public long Id { get; set; }
    [Required]
    public string Nome { get; set; } = "";
    /// <summary>Função na oficina (ex.: mecânico, borracheiro, eletricista).</summary>
    [Required]
    public string Funcao { get; set; } = "";
    /// <summary>Inativo some da lista da OS, mas continua no histórico.</summary>
    public bool Ativo { get; set; } = true;
    /// <summary>Login no sistema, se um dia ele for consultar pelo celular. Opcional.</summary>
    public string? UsuarioGuid { get; set; }
}
