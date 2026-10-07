using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Resultados;

namespace CheckTruck.Api.Dtos.Veiculos;

public class VeiculoSituacaoResponseDto
{
    public long Id { get; set; }
    public string Placa { get; set; }
    public string Chassi { get; set; }
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public DateTime AnoModelo { get; set; }
    public ModeloSituacaoDto Modelo { get; set; }
    public GeracaoModeloResumoDto Geracao { get; set; }
    public string Fabricante { get; set; }
    public string? NormaEmissao { get; set; }
    public UsuarioResumoDto? MotoristaAtual { get; set; }

    /// <summary>"ok", "atencao" ou "critico"</summary>
    public string Status { get; set; }

    /// <summary>Item de manutenção mais urgente; null quando o veículo não tem itens.</summary>
    public ItemManutencaoDto? ItemMaisUrgente { get; set; }

    /// <summary>
    /// Todos os itens, do mais urgente para o menos urgente. Só vem na consulta de um veículo
    /// (ex.: por placa); na lista de veículos fica null.
    /// </summary>
    public IList<ItemManutencaoDto>? Itens { get; set; }
}

public class ModeloSituacaoDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public int PotenciaCavalo { get; set; }
}

public class ItemManutencaoDto
{
    public long TipoManutencaoId { get; set; }
    public string TipoManutencaoNome { get; set; }

    /// <summary>Intervalo usado no cálculo.</summary>
    public int IntervaloKm { get; set; }
    public int IntervaloMeses { get; set; }

    /// <summary>De onde veio o intervalo: "veiculo", "modelo" ou "padrao".</summary>
    public string OrigemIntervalo { get; set; }

    /// <summary>Última troca registrada; null quando não há histórico no sistema.</summary>
    public DateTime? UltimaTrocaEm { get; set; }
    public int? UltimaTrocaKm { get; set; }

    public int KmProximaTroca { get; set; }

    /// <summary>Km até a próxima troca (negativo = vencido).</summary>
    public int KmRestante { get; set; }

    /// <summary>Data limite da próxima troca; null quando não há histórico ou o intervalo não tem prazo.</summary>
    public DateTime? DataProximaTroca { get; set; }

    /// <summary>Dias até a data limite (negativo = vencido); null quando não há data.</summary>
    public int? DiasRestantes { get; set; }

    public bool IsPrimeiraTroca { get; set; }

    /// <summary>"ok", "atencao" ou "critico" — o pior entre km e data.</summary>
    public string Status { get; set; }
}

public static class VeiculoSituacaoDtoExtensions
{
    public static VeiculoSituacaoResponseDto ToResponseDto(this SituacaoVeiculo situacao, bool incluirItens = false) => new()
    {
        Id = situacao.VeiculoId,
        Placa = situacao.Placa,
        Chassi = situacao.Chassi,
        KmAtual = situacao.KmAtual,
        Ativo = situacao.Ativo,
        AnoFabricacao = situacao.AnoFabricacao,
        AnoModelo = situacao.AnoModelo,
        Modelo = new ModeloSituacaoDto
        {
            Id = situacao.ModeloId,
            Nome = situacao.ModeloNome,
            PotenciaCavalo = situacao.PotenciaCavalo
        },
        Geracao = new GeracaoModeloResumoDto { Id = situacao.GeracaoId, Nome = situacao.GeracaoNome },
        Fabricante = situacao.FabricanteNome,
        NormaEmissao = situacao.NormaEmissao,
        MotoristaAtual = situacao.MotoristaAtualId is null
            ? null
            : new UsuarioResumoDto { Id = situacao.MotoristaAtualId, Nome = situacao.MotoristaAtualNome ?? "" },
        Status = situacao.Status.ToApiString(),
        ItemMaisUrgente = situacao.ItemMaisUrgente?.ToDto(),
        Itens = incluirItens ? situacao.Itens.Select(i => i.ToDto()).ToList() : null
    };

    public static ItemManutencaoDto ToDto(this ItemManutencao item) => new()
    {
        TipoManutencaoId = item.TipoManutencaoId,
        TipoManutencaoNome = item.TipoManutencaoNome,
        IntervaloKm = item.IntervaloKm,
        IntervaloMeses = item.IntervaloMeses,
        OrigemIntervalo = item.OrigemIntervalo.ToApiString(),
        UltimaTrocaEm = item.UltimaTrocaEm,
        UltimaTrocaKm = item.UltimaTrocaKm,
        KmProximaTroca = item.KmProximaTroca,
        KmRestante = item.KmRestante,
        DataProximaTroca = item.DataProximaTroca,
        DiasRestantes = item.DiasRestantes,
        IsPrimeiraTroca = item.IsPrimeiraTroca,
        Status = item.Status.ToApiString()
    };
}
