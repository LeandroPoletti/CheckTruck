using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Intervalos próprios de um caminhão (ex.: plano da concessionária): valem antes de todos os outros.
/// Um por item em cada caminhão.
/// </summary>
public class ServicoIntervaloVeiculo(IRepositorioCrud repositorioCrud, ILogger<ServicoIntervaloVeiculo> logger)
    : ServicoCrud<IntervaloVeiculo>(repositorioCrud, logger)
{
    public override bool Valida(IntervaloVeiculo entidade)
    {
        var jaExiste = Query(i => i.Id != entidade.Id
            && i.Veiculo.Id == entidade.Veiculo.Id && i.TipoManutencao.Id == entidade.TipoManutencao.Id).Any();
        if (jaExiste)
        {
            Mensagens.Add("Esse caminhão já tem um intervalo próprio para esse item. Altere o existente.");
        }

        return base.Valida(entidade);
    }
}
