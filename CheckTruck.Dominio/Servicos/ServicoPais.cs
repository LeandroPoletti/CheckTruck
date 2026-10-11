using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Países de origem dos fabricantes. O nome não repete, e país com fabricante não pode ser excluído.
/// O país do sistema só o dono do sistema muda (ver <see cref="ServicoCatalogo{T}"/>).
/// </summary>
public class ServicoPais(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Fabricante> servicoFabricante,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoPais> logger) : ServicoCatalogo<Pais>(repositorioCrud, usuarioLogado, logger)
{
    /// <summary>Não repete o nome (contam o país do sistema e os da empresa).</summary>
    public override bool Valida(Pais entidade)
    {
        var nome = entidade.Nome.ToLower();
        if (Query(p => p.Id != entidade.Id && p.Nome.ToLower() == nome).Any())
        {
            Mensagens.Add("Já existe um país com esse nome.");
        }

        return base.Valida(entidade);
    }

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
