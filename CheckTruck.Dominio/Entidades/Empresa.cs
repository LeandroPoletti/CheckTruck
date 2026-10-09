using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Cliente do CheckTruck. Cada empresa só vê os próprios caminhões, OS, chamados, mecânicos e acessos;
/// o catálogo (fabricantes, modelos, gerações) e os tipos de manutenção são de todas.
/// </summary>
public class Empresa : EntidadeBanco
{
    public long Id { get; set; }
    public string Nome { get; set; } = "";
}
