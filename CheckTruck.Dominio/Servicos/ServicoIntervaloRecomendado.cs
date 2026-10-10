using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Intervalos de troca de cada geração. Para cada geração e item: um de fábrica (do sistema, ex.: manual do
/// fabricante, que só o dono do sistema muda) e um por empresa (o plano dela, que vale antes do de fábrica).
/// </summary>
public class ServicoIntervaloRecomendado(
    IRepositorioCrud repositorioCrud,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoIntervaloRecomendado> logger) : ServicoCatalogo<IntervaloRecomendado>(repositorioCrud, usuarioLogado, logger)
{
    public override bool Valida(IntervaloRecomendado entidade)
    {
        var empresaId = EmpresaAtual;
        var jaExiste = Query(i => i.Id != entidade.Id && i.EmpresaId == empresaId
            && i.Geracao.Id == entidade.Geracao.Id && i.TipoManutencao.Id == entidade.TipoManutencao.Id).Any();
        if (jaExiste)
        {
            Mensagens.Add(empresaId is null
                ? "Essa geração já tem intervalo de fábrica para esse item. Altere o existente."
                : "Sua empresa já tem intervalo para esse item nessa geração. Altere o existente.");
        }

        return base.Valida(entidade);
    }
}
