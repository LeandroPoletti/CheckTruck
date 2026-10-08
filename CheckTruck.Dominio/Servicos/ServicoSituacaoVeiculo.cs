using System.Linq.Expressions;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Resultados;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Calcula no servidor a situação de manutenção de cada veículo: para cada item, a próxima troca
/// por km e por data, quanto falta e o status. Vence o que chegar primeiro (km ou data).
/// O intervalo de cada item segue a prioridade caminhão → geração → padrão seguro.
/// </summary>
public class ServicoSituacaoVeiculo(IRepositorioCrud repositorioCrud, ILogger<ServicoSituacaoVeiculo> logger)
{
    // RN-08: alerta quando faltam 5.000 km ou 30 dias para a próxima troca
    public const int MargemAlertaKm = 5000;
    public const int MargemAlertaDias = 30;

    public IList<SituacaoVeiculo> ObterSituacaoVeiculos(bool apenasAtivos)
    {
        logger.LogDebug("Calculando situação dos veículos (apenas ativos: {ApenasAtivos})", apenasAtivos);
        return Calcular(v => !apenasAtivos || v.Ativo);
    }

    /// <summary>Situação completa de um caminhão (todos os itens), para a tela de detalhe.</summary>
    public SituacaoVeiculo? ObterSituacao(long veiculoId)
    {
        logger.LogDebug("Calculando situação do veículo {VeiculoId}", veiculoId);
        return Calcular(v => v.Id == veiculoId).FirstOrDefault();
    }

    /// <summary>Situação completa de um caminhão pela placa (com ou sem hífen, maiúscula ou minúscula).</summary>
    public SituacaoVeiculo? ObterSituacaoPorPlaca(string placa)
    {
        var placaNormalizada = NormalizarPlaca(placa);
        logger.LogDebug("Calculando situação do veículo de placa {Placa}", placaNormalizada);
        if (placaNormalizada.Length == 0) return null;

        return Calcular(v => v.Placa.ToUpper().Replace("-", "").Replace(" ", "") == placaNormalizada)
            .FirstOrDefault();
    }

    /// <summary>
    /// Padrão seguro de cada tipo de manutenção para os caminhões de uma geração (depende da norma de emissão).
    /// Tipo sem padrão (ex.: embreagem) fica de fora. null quando a geração não existe.
    /// </summary>
    public IDictionary<long, IntervaloResolvido>? ObterPadraoDaGeracao(long geracaoId)
    {
        var norma = repositorioCrud.Query<Geracao>(g => g.Id == geracaoId)
            .Select(g => (NormaEmissao?)g.NormaEmissao)
            .FirstOrDefault();
        if (norma is null) return null;

        return repositorioCrud.Query<TipoManutencao>(_ => true)
            .Select(t => new { t.Id, t.Componente })
            .ToList()
            .Select(t => (t.Id, Padrao: IntervalosPadrao.Obter(t.Componente, norma.Value)))
            .Where(t => t.Padrao is not null)
            .ToDictionary(t => t.Id, t => t.Padrao!);
    }

    /// <summary>
    /// Intervalo que vale para um caminhão e um tipo de manutenção (caminhão → geração → padrão seguro).
    /// null quando o veículo ou o tipo não existem, ou quando não há intervalo nem padrão para o item.
    /// </summary>
    public IntervaloResolvido? ResolverIntervalo(long veiculoId, long tipoManutencaoId)
    {
        var veiculo = repositorioCrud.Query<Veiculo>(v => v.Id == veiculoId)
            .Select(v => new { GeracaoId = v.Potencia.Geracao.Id, v.Potencia.Geracao.NormaEmissao })
            .FirstOrDefault();
        var componente = repositorioCrud.Query<TipoManutencao>(t => t.Id == tipoManutencaoId)
            .Select(t => (Componente?)t.Componente)
            .FirstOrDefault();
        if (veiculo is null || componente is null) return null;

        var intervaloVeiculo = repositorioCrud
            .Query<IntervaloVeiculo>(i => i.Veiculo.Id == veiculoId && i.TipoManutencao.Id == tipoManutencaoId)
            .Select(i => new { i.IntervaloKm, i.IntervaloMeses })
            .FirstOrDefault();
        var intervaloGeracao = repositorioCrud
            .Query<IntervaloRecomendado>(i => i.Geracao.Id == veiculo.GeracaoId && i.TipoManutencao.Id == tipoManutencaoId)
            .Select(i => new { i.IntervaloKm, i.IntervaloMeses, i.IntervaloKmPrimeira })
            .FirstOrDefault();

        (int km, int meses)? doVeiculo = intervaloVeiculo is null
            ? null
            : (intervaloVeiculo.IntervaloKm, intervaloVeiculo.IntervaloMeses);
        (int km, int meses, int kmPrimeira)? daGeracao = intervaloGeracao is null
            ? null
            : (intervaloGeracao.IntervaloKm, intervaloGeracao.IntervaloMeses, intervaloGeracao.IntervaloKmPrimeira);

        return IntervalosPadrao.Resolver(doVeiculo, daGeracao, componente.Value, veiculo.NormaEmissao);
    }

    public static string NormalizarPlaca(string? placa) =>
        new string((placa ?? "").Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();

    public static StatusManutencao StatusPorKmRestante(int kmRestante)
    {
        if (kmRestante <= 0) return StatusManutencao.Critico;
        if (kmRestante <= MargemAlertaKm) return StatusManutencao.Atencao;
        return StatusManutencao.Ok;
    }

    public static StatusManutencao StatusPorDiasRestantes(int? diasRestantes)
    {
        if (diasRestantes is null) return StatusManutencao.Ok;
        if (diasRestantes <= 0) return StatusManutencao.Critico;
        if (diasRestantes <= MargemAlertaDias) return StatusManutencao.Atencao;
        return StatusManutencao.Ok;
    }

    public static DateTime? CalcularDataProximaTroca(DateTime realizadoEm, int intervaloMeses) =>
        intervaloMeses > 0 ? realizadoEm.AddMonths(intervaloMeses) : null;

    private IList<SituacaoVeiculo> Calcular(Expression<Func<Veiculo, bool>> filtro)
    {
        // Só projeções: o EF traduz as navegações para JOINs, sem carregar entidades inteiras.
        var veiculos = repositorioCrud.Query(filtro)
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
                Tracao = v.Tracao,
                PotenciaCv = v.Potencia.Cv,
                GeracaoId = v.Potencia.Geracao.Id,
                GeracaoNome = v.Potencia.Geracao.Nome,
                NormaEmissao = v.Potencia.Geracao.NormaEmissao,
                Motor = v.Potencia.Geracao.Motor,
                Caixa = v.Potencia.Geracao.Caixa,
                ModeloId = v.Potencia.Geracao.Modelo.Id,
                ModeloNome = v.Potencia.Geracao.Modelo.Nome,
                FabricanteNome = v.Potencia.Geracao.Modelo.Fabricante.Nome,
                MotoristaAtualId = v.MotoristaAtual == null ? null : v.MotoristaAtual.Id,
                MotoristaAtualNome = v.MotoristaAtual == null ? null : v.MotoristaAtual.Nome,
            })
            .ToList();

        if (veiculos.Count == 0) return veiculos;

        var veiculoIds = veiculos.Select(v => v.VeiculoId).ToList();
        var geracaoIds = veiculos.Select(v => v.GeracaoId).Distinct().ToList();

        var tipos = repositorioCrud.Query<TipoManutencao>(_ => true)
            .OrderBy(t => t.Id)
            .Select(t => new { t.Id, t.Nome, t.Componente })
            .ToList();

        var intervalosGeracao = repositorioCrud.Query<IntervaloRecomendado>(i => geracaoIds.Contains(i.Geracao.Id))
            .Select(i => new
            {
                GeracaoId = i.Geracao.Id,
                TipoId = i.TipoManutencao.Id,
                i.IntervaloKm,
                i.IntervaloMeses,
                i.IntervaloKmPrimeira,
            })
            .ToList()
            .GroupBy(i => (i.GeracaoId, i.TipoId))
            .ToDictionary(g => g.Key, g => g.First());

        var intervalosVeiculo = repositorioCrud.Query<IntervaloVeiculo>(i => veiculoIds.Contains(i.Veiculo.Id))
            .Select(i => new
            {
                VeiculoId = i.Veiculo.Id,
                TipoId = i.TipoManutencao.Id,
                i.IntervaloKm,
                i.IntervaloMeses,
            })
            .ToList()
            .GroupBy(i => (i.VeiculoId, i.TipoId))
            .ToDictionary(g => g.Key, g => g.First());

        // Última troca de cada item em cada veículo (a próxima troca já foi gravada nela — RN-07)
        var ultimasTrocas = repositorioCrud.Query<Manutencao>(m => veiculoIds.Contains(m.Veiculo.Id))
            .Select(m => new
            {
                m.Id,
                VeiculoId = m.Veiculo.Id,
                TipoId = m.TipoManutencao.Id,
                m.RealizadoEm,
                m.KmAtual,
                m.KmProximaTroca,
                m.DataProximaTroca,
            })
            .ToList()
            .GroupBy(m => (m.VeiculoId, m.TipoId))
            .ToDictionary(g => g.Key, g => g.OrderByDescending(m => m.RealizadoEm).ThenByDescending(m => m.Id).First());

        var hoje = DateTime.UtcNow.Date;

        foreach (var veiculo in veiculos)
        {
            var itens = new List<ItemManutencao>();

            foreach (var tipo in tipos)
            {
                (int km, int meses)? doVeiculo =
                    intervalosVeiculo.TryGetValue((veiculo.VeiculoId, tipo.Id), out var iv)
                        ? (iv.IntervaloKm, iv.IntervaloMeses)
                        : null;
                (int km, int meses, int kmPrimeira)? daGeracao =
                    intervalosGeracao.TryGetValue((veiculo.GeracaoId, tipo.Id), out var ig)
                        ? (ig.IntervaloKm, ig.IntervaloMeses, ig.IntervaloKmPrimeira)
                        : null;

                var intervalo = IntervalosPadrao.Resolver(doVeiculo, daGeracao, tipo.Componente, veiculo.NormaEmissao);
                if (intervalo is null) continue; // item sem intervalo cadastrado e sem padrão (ex.: embreagem)

                var item = new ItemManutencao
                {
                    TipoManutencaoId = tipo.Id,
                    TipoManutencaoNome = tipo.Nome,
                    IntervaloKm = intervalo.IntervaloKm,
                    IntervaloMeses = intervalo.IntervaloMeses,
                    OrigemIntervalo = intervalo.Origem,
                };

                if (ultimasTrocas.TryGetValue((veiculo.VeiculoId, tipo.Id), out var ultima))
                {
                    item.UltimaTrocaEm = ultima.RealizadoEm;
                    item.UltimaTrocaKm = ultima.KmAtual;
                    // Registros antigos podem não ter a próxima troca gravada: calcula pelo intervalo atual
                    item.KmProximaTroca = ultima.KmProximaTroca > 0
                        ? ultima.KmProximaTroca
                        : ultima.KmAtual + intervalo.IntervaloKm;
                    item.DataProximaTroca = ultima.DataProximaTroca
                        ?? CalcularDataProximaTroca(ultima.RealizadoEm, intervalo.IntervaloMeses);
                }
                else
                {
                    // Sem histórico no sistema não dá para saber a data da última troca: vence só por km
                    var (kmProximaTroca, isPrimeira) = CalcularSemHistorico(
                        veiculo.KmAtual, intervalo.IntervaloKm, intervalo.IntervaloKmPrimeira);
                    item.KmProximaTroca = kmProximaTroca;
                    item.IsPrimeiraTroca = isPrimeira;
                }

                item.KmRestante = item.KmProximaTroca - veiculo.KmAtual;
                item.DiasRestantes = item.DataProximaTroca is { } data
                    ? (int)Math.Floor((data.Date - hoje).TotalDays)
                    : null;
                item.Status = Pior(StatusPorKmRestante(item.KmRestante), StatusPorDiasRestantes(item.DiasRestantes));

                itens.Add(item);
            }

            veiculo.Itens = itens
                .OrderByDescending(i => i.Status)
                .ThenBy(i => i.KmRestante)
                .ToList();
            veiculo.ItemMaisUrgente = veiculo.Itens.FirstOrDefault();
            veiculo.Status = veiculo.ItemMaisUrgente?.Status ?? StatusManutencao.Ok;
        }

        return veiculos;
    }

    private static StatusManutencao Pior(StatusManutencao a, StatusManutencao b) => a >= b ? a : b;

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
