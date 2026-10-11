using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Resultados;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Resume a situação da frota ativa para os dashboards: quantos itens estão em cada status, alertas
/// (caminhões em atenção/crítico com todos os itens que precisam de cuidado) e quantidade de veículos por geração.
/// </summary>
public class ServicoDashboard(ServicoSituacaoVeiculo servicoSituacao, ILogger<ServicoDashboard> logger)
{
    public SituacaoFrota ObterSituacaoFrota(int? limiteAlertas = null)
    {
        logger.LogDebug("Calculando situação da frota ativa");

        var veiculos = servicoSituacao.ObterSituacaoVeiculos(apenasAtivos: true);

        // Os itens de cada caminhão já vêm do mais urgente para o menos urgente
        var alertas = veiculos
            .Where(v => v.Status != StatusManutencao.Ok)
            .OrderByDescending(v => v.Status)
            .ThenBy(v => v.ItemMaisUrgente!.KmRestante)
            .Select(v => new AlertaManutencao
            {
                VeiculoId = v.VeiculoId,
                Placa = v.Placa,
                KmAtual = v.KmAtual,
                FabricanteNome = v.FabricanteNome,
                ModeloNome = v.ModeloNome,
                GeracaoNome = v.GeracaoNome,
                Status = v.Status,
                Itens = v.Itens.Where(i => i.Status != StatusManutencao.Ok).ToList(),
            });

        var itens = veiculos.SelectMany(v => v.Itens).ToList();

        return new SituacaoFrota
        {
            FrotaAtiva = veiculos.Count,
            QuantidadeOk = itens.Count(i => i.Status == StatusManutencao.Ok),
            QuantidadeAtencao = itens.Count(i => i.Status == StatusManutencao.Atencao),
            QuantidadeCritico = itens.Count(i => i.Status == StatusManutencao.Critico),
            Alertas = (limiteAlertas is > 0 ? alertas.Take(limiteAlertas.Value) : alertas).ToList(),
            FrotaPorGeracao = veiculos
                .GroupBy(v => new { v.GeracaoId, v.GeracaoNome, v.ModeloNome, v.FabricanteNome })
                .OrderBy(g => g.Key.FabricanteNome)
                .ThenBy(g => g.Key.ModeloNome)
                .ThenBy(g => g.Key.GeracaoId)
                .Select(g => new QuantidadePorGeracao
                {
                    GeracaoId = g.Key.GeracaoId,
                    GeracaoNome = g.Key.GeracaoNome,
                    ModeloNome = g.Key.ModeloNome,
                    FabricanteNome = g.Key.FabricanteNome,
                    Quantidade = g.Count(),
                })
                .ToList(),
        };
    }
}
