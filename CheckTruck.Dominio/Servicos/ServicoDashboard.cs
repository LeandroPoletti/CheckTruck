using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Resultados;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Resume a situação da frota ativa para os dashboards: contagens por status, alertas
/// (item mais urgente de cada veículo em atenção/crítico) e quantidade de veículos por geração.
/// </summary>
public class ServicoDashboard(ServicoSituacaoVeiculo servicoSituacao, ILogger<ServicoDashboard> logger)
{
    public SituacaoFrota ObterSituacaoFrota(int? limiteAlertas = null)
    {
        logger.LogDebug("Calculando situação da frota ativa");

        var veiculos = servicoSituacao.ObterSituacaoVeiculos(apenasAtivos: true);

        var alertas = veiculos
            .Where(v => v.ItemMaisUrgente is { Status: not StatusManutencao.Ok })
            .OrderByDescending(v => v.ItemMaisUrgente!.Status)
            .ThenBy(v => v.ItemMaisUrgente!.KmRestante)
            .Select(v => new AlertaManutencao
            {
                VeiculoId = v.VeiculoId,
                Placa = v.Placa,
                KmAtual = v.KmAtual,
                ModeloNome = v.ModeloNome,
                GeracaoNome = v.GeracaoNome,
                TipoManutencaoId = v.ItemMaisUrgente!.TipoManutencaoId,
                TipoManutencaoNome = v.ItemMaisUrgente.TipoManutencaoNome,
                KmProximaTroca = v.ItemMaisUrgente.KmProximaTroca,
                KmRestante = v.ItemMaisUrgente.KmRestante,
                DataProximaTroca = v.ItemMaisUrgente.DataProximaTroca,
                DiasRestantes = v.ItemMaisUrgente.DiasRestantes,
                IsPrimeiraTroca = v.ItemMaisUrgente.IsPrimeiraTroca,
                Status = v.ItemMaisUrgente.Status,
            });

        return new SituacaoFrota
        {
            FrotaAtiva = veiculos.Count,
            MargemAlertaKm = ServicoSituacaoVeiculo.MargemAlertaKm,
            MargemAlertaDias = ServicoSituacaoVeiculo.MargemAlertaDias,
            QuantidadeOk = veiculos.Count(v => v.Status == StatusManutencao.Ok),
            QuantidadeAtencao = veiculos.Count(v => v.Status == StatusManutencao.Atencao),
            QuantidadeCritico = veiculos.Count(v => v.Status == StatusManutencao.Critico),
            Alertas = (limiteAlertas is > 0 ? alertas.Take(limiteAlertas.Value) : alertas).ToList(),
            FrotaPorGeracao = veiculos
                .GroupBy(v => new { v.GeracaoId, v.GeracaoNome })
                .OrderBy(g => g.Key.GeracaoId)
                .Select(g => new QuantidadePorGeracao
                {
                    GeracaoId = g.Key.GeracaoId,
                    GeracaoNome = g.Key.GeracaoNome,
                    Quantidade = g.Count(),
                })
                .ToList(),
        };
    }
}
