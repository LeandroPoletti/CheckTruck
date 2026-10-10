namespace CheckTruck.Dominio.Interfaces;

/// <summary>
/// Item do catálogo (país, fabricante, modelo, geração, potência, tipo de manutenção e intervalo da geração).
/// Sem empresa é do sistema: toda empresa vê e só o dono do sistema mexe. Com empresa é dela: só ela vê e mexe.
/// O Context grava quem cadastrou e filtra as consultas.
/// </summary>
public interface ItemDoCatalogo : EntidadeBanco
{
    /// <summary>null = do sistema; senão, a empresa que cadastrou.</summary>
    public long? EmpresaId { get; set; }
}
