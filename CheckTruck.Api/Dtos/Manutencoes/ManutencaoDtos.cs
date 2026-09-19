using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Manutencoes;

public class ManutencaoRequestDto
{
    [Required]
    public long VeiculoId { get; set; }

    [Required]
    public long TipoManutencaoId { get; set; }

    [Required]
    public long TecnicoId { get; set; }

    public DateTime RealizadoEm { get; set; } = DateTime.Now;
    public DateTime? DataProximaTroca { get; set; }
    public int KmAtual { get; set; }
    public int KmProximaTroca { get; set; }
    public bool IsPrimeiraTroca { get; set; }

    [Required]
    public string NumNotaFiscal { get; set; }

    public string Observacao { get; set; }

    [Required]
    public string Concessionaria { get; set; }
}

public class ManutencaoResponseDto
{
    public long Id { get; set; }
    public VeiculoResumoDto Veiculo { get; set; }
    public TipoManutencaoResumoDto TipoManutencao { get; set; }
    public TecnicoResumoDto Tecnico { get; set; }
    public DateTime RealizadoEm { get; set; }
    public DateTime? DataProximaTroca { get; set; }
    public int KmAtual { get; set; }
    public int KmProximaTroca { get; set; }
    public bool IsPrimeiraTroca { get; set; }
    public string NumNotaFiscal { get; set; }
    public string Observacao { get; set; }
    public string Concessionaria { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
}

public static class ManutencaoDtoExtensions
{
    public static ManutencaoResponseDto ToResponseDto(this Manutencao entidade) => new()
    {
        Id = entidade.Id,
        Veiculo = entidade.Veiculo?.ToResumoDto(),
        TipoManutencao = entidade.TipoManutencao?.ToResumoDto(),
        Tecnico = entidade.Tecnico?.ToResumoDto(),
        RealizadoEm = entidade.RealizadoEm,
        DataProximaTroca = entidade.DataProximaTroca,
        KmAtual = entidade.KmAtual,
        KmProximaTroca = entidade.KmProximaTroca,
        IsPrimeiraTroca = entidade.IsPrimeiraTroca,
        NumNotaFiscal = entidade.NumNotaFiscal,
        Observacao = entidade.Observacao,
        Concessionaria = entidade.Concessionaria,
        CriadoEm = entidade.CriadoEm,
        AtualizadoEm = entidade.AtualizadoEm
    };

    public static Manutencao ToEntity(this ManutencaoRequestDto dto, Veiculo veiculo, TipoManutencao tipoManutencao, Tecnico tecnico) => new()
    {
        Veiculo = veiculo,
        TipoManutencao = tipoManutencao,
        Tecnico = tecnico,
        RealizadoEm = dto.RealizadoEm,
        DataProximaTroca = dto.DataProximaTroca,
        KmAtual = dto.KmAtual,
        KmProximaTroca = dto.KmProximaTroca,
        IsPrimeiraTroca = dto.IsPrimeiraTroca,
        NumNotaFiscal = dto.NumNotaFiscal,
        Observacao = dto.Observacao,
        Concessionaria = dto.Concessionaria
    };
}
