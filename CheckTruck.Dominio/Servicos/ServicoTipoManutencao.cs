using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Itens que o sistema acompanha nos caminhões (óleo do motor, filtro de ar...). Cada item é de um
/// componente, que dá o padrão seguro quando não há intervalo cadastrado. Item com OS lançada ou
/// intervalo cadastrado não pode ser excluído: o histórico dos caminhões depende dele.
/// </summary>
public class ServicoTipoManutencao(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Manutencao> servicoManutencao,
    ServicoCrud<IntervaloRecomendado> servicoIntervaloModelo,
    ServicoCrud<IntervaloVeiculo> servicoIntervaloVeiculo,
    ILogger<ServicoTipoManutencao> logger) : ServicoCrud<TipoManutencao>(repositorioCrud, logger)
{
    public override bool Valida(TipoManutencao entidade)
    {
        entidade.Nome = entidade.Nome.Trim();
        if (entidade.Nome.Length == 0)
        {
            Mensagens.Add("Informe o nome.");
        }

        if (!Enum.IsDefined(entidade.Componente))
        {
            Mensagens.Add("Escolha o componente.");
        }

        var nome = entidade.Nome.ToLower();
        if (Query(t => t.Id != entidade.Id && t.Nome.ToLower() == nome).Any())
        {
            Mensagens.Add("Já existe um tipo de manutenção com esse nome.");
        }

        return base.Valida(entidade);
    }

    public override TipoManutencao? Deletar(long id)
    {
        var emUso = servicoManutencao.Query(m => m.TipoManutencao.Id == id).Any()
            || servicoIntervaloModelo.Query(i => i.TipoManutencao.Id == id).Any()
            || servicoIntervaloVeiculo.Query(i => i.TipoManutencao.Id == id).Any();
        if (emUso)
        {
            Mensagens.Add("Esse item já tem OS lançada ou intervalo cadastrado, então não dá para excluir.");
            return null;
        }

        return base.Deletar(id);
    }
}
