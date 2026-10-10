using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Países de origem dos fabricantes. País com fabricante não pode ser excluído.
/// O país do sistema só o dono do sistema muda (ver <see cref="ServicoCatalogo{T}"/>).
/// </summary>
public class ServicoPais(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Fabricante> servicoFabricante,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoPais> logger) : ServicoCatalogo<Pais>(repositorioCrud, usuarioLogado, logger)
{
    protected override bool EmUso(long id)
    {
        var fabricantes = servicoFabricante.QueryTodasAsEmpresas(f => f.PaisOrigem.Id == id).Count();
        if (fabricantes == 0)
        {
            return false;
        }

        Mensagens.Add($"Não é possível excluir: o país possui {fabricantes} fabricante(s) cadastrado(s).");
        return true;
    }
}
