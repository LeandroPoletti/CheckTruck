using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Modelos (linhas) de cada fabricante: FH, FM, R, Actros... Modelo com geração não pode ser excluído.
/// O modelo do sistema só o dono do sistema muda (ver <see cref="ServicoCatalogo{T}"/>).
/// </summary>
public class ServicoModelo(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Geracao> servicoGeracao,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoModelo> logger) : ServicoCatalogo<Modelo>(repositorioCrud, usuarioLogado, logger)
{
    protected override bool EmUso(long id)
    {
        var geracoes = servicoGeracao.QueryTodasAsEmpresas(g => g.Modelo.Id == id).Count();
        if (geracoes == 0)
        {
            return false;
        }

        Mensagens.Add($"Não é possível excluir: o modelo possui {geracoes} geração(ões) cadastrada(s).");
        return true;
    }
}
