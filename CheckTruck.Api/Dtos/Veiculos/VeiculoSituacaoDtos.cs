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
    public MotoristaResumoDto? Motorista { get; set; }

    /// <summary>"ok", "atencao" ou "critico"</summary>
    public string Status { get; set; }

    /// <summary>Item de manutenção mais urgente; null quando o modelo não tem intervalos.</summary>
    public ItemManutencaoDto? ItemMaisUrgente { get; set; }
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
    public int KmProximaTroca { get; set; }
    public int KmRestante { get; set; }
    public bool IsPrimeiraTroca { get; set; }
    public string Status { get; set; }
}

public static class VeiculoSituacaoDtoExtensions
{
    public static VeiculoSituacaoResponseDto ToResponseDto(this SituacaoVeiculo situacao) => new()
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
        Motorista = situacao.MotoristaId is null
            ? null
            : new MotoristaResumoDto { Id = situacao.MotoristaId.Value, Cpf = situacao.MotoristaCpf },
        Status = situacao.Status.ToApiString(),
        ItemMaisUrgente = situacao.ItemMaisUrgente is null
            ? null
            : new ItemManutencaoDto
            {
                TipoManutencaoId = situacao.ItemMaisUrgente.TipoManutencaoId,
                TipoManutencaoNome = situacao.ItemMaisUrgente.TipoManutencaoNome,
                KmProximaTroca = situacao.ItemMaisUrgente.KmProximaTroca,
                KmRestante = situacao.ItemMaisUrgente.KmRestante,
                IsPrimeiraTroca = situacao.ItemMaisUrgente.IsPrimeiraTroca,
                Status = situacao.ItemMaisUrgente.Status.ToApiString()
            }
    };
}
