using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Modelos (linhas) de cada fabricante: FH, FM, R, Actros... O nome não repete no mesmo fabricante, e modelo
/// com geração não pode ser excluído.
/// O modelo do sistema só o dono do sistema muda (ver <see cref="ServicoCatalogo{T}"/>).
/// </summary>
public class ServicoModelo(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Geracao> servicoGeracao,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoModelo> logger) : ServicoCatalogo<Modelo>(repositorioCrud, usuarioLogado, logger)
{
    /// <summary>O fabricante não tem dois modelos com o mesmo nome (contam o do sistema e os da empresa).</summary>
    public override bool Valida(Modelo entidade)
    {
        var nome = entidade.Nome.ToLower();
        if (Query(m => m.Id != entidade.Id && m.Fabricante.Id == entidade.Fabricante.Id && m.Nome.ToLower() == nome).Any())
        {
            Mensagens.Add("Esse fabricante já tem um modelo com esse nome.");
        }

        return base.Valida(entidade);
    }

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
