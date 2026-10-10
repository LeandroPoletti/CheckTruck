using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Fabricantes de caminhão (Volvo, Scania...). Fabricante com modelo não pode ser excluído.
/// O fabricante do sistema só o dono do sistema muda (ver <see cref="ServicoCatalogo{T}"/>).
/// </summary>
public class ServicoFabricante(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Modelo> servicoModelo,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoFabricante> logger) : ServicoCatalogo<Fabricante>(repositorioCrud, usuarioLogado, logger)
{
    protected override bool EmUso(long id)
    {
        var modelos = servicoModelo.QueryTodasAsEmpresas(m => m.Fabricante.Id == id).Count();
        if (modelos == 0)
        {
            return false;
        }

        Mensagens.Add($"Não é possível excluir: o fabricante possui {modelos} modelo(s) cadastrado(s).");
        return true;
    }
}
