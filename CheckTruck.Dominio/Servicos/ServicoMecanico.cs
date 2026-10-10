using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Mecânicos (no Autônomo, oficinas ou mecânicos) que fazem as trocas. É só um cadastro, sem login.
/// Quem tem OS lançada não é excluído: o certo é desativar, e ele continua no histórico.
/// </summary>
public class ServicoMecanico(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Manutencao> servicoManutencao,
    ILogger<ServicoMecanico> logger) : ServicoCrud<Mecanico>(repositorioCrud, logger)
{
    protected override bool EmUso(long id)
    {
        var temOs = servicoManutencao.Query(m => m.Mecanico.Id == id).Any();
        if (temOs)
        {
            Mensagens.Add("Esse mecânico tem OS lançadas. Desative o cadastro em vez de excluir.");
        }

        return temOs;
    }
}
