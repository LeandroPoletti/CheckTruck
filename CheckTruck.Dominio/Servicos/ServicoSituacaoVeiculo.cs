using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Resultados;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Calcula no servidor a situação de manutenção de cada veículo (próxima troca, km restante e status),
/// para que as telas não precisem baixar todas as manutenções e intervalos da frota.
/// </summary>
public class ServicoSituacaoVeiculo(IRepositorioCrud repositorioCrud, ILogger<ServicoSituacaoVeiculo> logger)
{
    // RN-08: alerta quando km_atual >= km_proxima_troca - margem
    public const int MargemAlertaKm = 5000;

    public IList<SituacaoVeiculo> ObterSituacaoVeiculos(bool apenasAtivos)
    {
        logger.LogDebug("Calculando situação dos veículos (apenas ativos: {ApenasAtivos})", apenasAtivos);

        // Só projeções: o EF traduz as navegações para JOINs, sem carregar entidades inteiras.
        var veiculos = repositorioCrud.Query<Veiculo>(v => !apenasAtivos || v.Ativo)
            .OrderBy(v => v.Placa)
            .Select(v => new SituacaoVeiculo
            {
                VeiculoId = v.Id,
                Placa = v.Placa,
                Chassi = v.Chassi,
                KmAtual = v.KmAtual,
                Ativo = v.Ativo,
                AnoFabricacao = v.AnoFabricacao,
                AnoModelo = v.AnoModelo,
                ModeloId = v.Modelo.Id,
                ModeloNome = v.Modelo.Nome,
                PotenciaCavalo = v.Modelo.PotenciaCavalo,
                GeracaoId = v.Modelo.Geracao.Id,
                GeracaoNome = v.Modelo.Geracao.Nome,
                MotoristaId = v.Motorista == null ? null : v.Motorista.Id,
                MotoristaCpf = v.Motorista == null ? null : v.Motorista.Cpf,
            })
            .ToList();

        var intervalosPorModelo = repositorioCrud.Query<IntervaloRecomendado>(_ => true)
            .Select(i => new
            {
                ModeloId = i.Modelo.Id,
                TipoId = i.TipoManutencao.Id,
                TipoNome = i.TipoManutencao.Nome,
                i.IntervaloKm,
                i.IntervaloKmPrimeira,
            })
            .ToList()
            .ToLookup(i => i.ModeloId);

        // Última manutenção de cada tipo em cada veículo (a próxima troca já foi salva nela — RN-07)
        var ultimaTroca = repositorioCrud.Query<Manutencao>(m => !apenasAtivos || m.Veiculo.Ativo)
            .GroupBy(m => new { VeiculoId = m.Veiculo.Id, TipoId = m.TipoManutencao.Id })
            .Select(g => new
            {
                g.Key.VeiculoId,
                g.Key.TipoId,
                KmProximaTroca = g
                    .OrderByDescending(m => m.RealizadoEm)
                    .ThenByDescending(m => m.Id)
                    .Select(m => m.KmProximaTroca)
                    .First(),
            })
            .ToDictionary(u => (u.VeiculoId, u.TipoId), u => u.KmProximaTroca);

        foreach (var veiculo in veiculos)
        {
            foreach (var intervalo in intervalosPorModelo[veiculo.ModeloId])
            {
                var (kmProximaTroca, isPrimeira) = ultimaTroca.TryGetValue((veiculo.VeiculoId, intervalo.TipoId), out var km)
                    ? (km, false)
                    : CalcularSemHistorico(veiculo.KmAtual, intervalo.IntervaloKm, intervalo.IntervaloKmPrimeira);

                var kmRestante = kmProximaTroca - veiculo.KmAtual;
                if (veiculo.ItemMaisUrgente is not null && kmRestante >= veiculo.ItemMaisUrgente.KmRestante) continue;

                veiculo.ItemMaisUrgente = new ItemManutencao
                {
                    TipoManutencaoId = intervalo.TipoId,
                    TipoManutencaoNome = intervalo.TipoNome,
                    KmProximaTroca = kmProximaTroca,
                    KmRestante = kmRestante,
                    IsPrimeiraTroca = isPrimeira,
                    Status = StatusPorKmRestante(kmRestante),
                };
            }

            // O status do veículo é o do item mais urgente (menor km restante = pior status)
            veiculo.Status = veiculo.ItemMaisUrgente?.Status ?? StatusManutencao.Ok;
        }

        return veiculos;
    }

    public static StatusManutencao StatusPorKmRestante(int kmRestante)
    {
        if (kmRestante <= 0) return StatusManutencao.Critico;
        if (kmRestante <= MargemAlertaKm) return StatusManutencao.Atencao;
        return StatusManutencao.Ok;
    }

    // Sem histórico no sistema: usa o km de amaciamento (IntervaloKmPrimeira; 0 = igual ao padrão).
    // Se o veículo já passou dele, assume ciclos regulares desde então e aponta o próximo múltiplo.
    private static (int kmProximaTroca, bool isPrimeira) CalcularSemHistorico(int kmAtual, int intervaloKm, int intervaloKmPrimeira)
    {
        var limiarPrimeira = intervaloKmPrimeira > 0 ? intervaloKmPrimeira : intervaloKm;
        if (kmAtual < limiarPrimeira) return (limiarPrimeira, true);
        if (intervaloKm <= 0) return (limiarPrimeira, false); // intervalo inválido: evita divisão por zero

        var ciclos = (kmAtual - limiarPrimeira) / intervaloKm + 1;
        return (limiarPrimeira + ciclos * intervaloKm, false);
    }
}
