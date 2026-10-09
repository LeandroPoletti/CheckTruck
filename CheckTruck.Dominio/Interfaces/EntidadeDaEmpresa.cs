namespace CheckTruck.Dominio.Interfaces;

/// <summary>
/// Registro que pertence a uma empresa (caminhão, OS, chamado...). A coluna EmpresaId fica só no banco:
/// o Context grava a empresa de quem está logado e filtra todas as consultas por ela.
/// </summary>
public interface EntidadeDaEmpresa : EntidadeBanco
{
}
