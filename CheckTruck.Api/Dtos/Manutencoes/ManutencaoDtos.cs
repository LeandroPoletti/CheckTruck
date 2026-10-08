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

    public DateTime RealizadoEm { get; set; } = DateTime.UtcNow;

    /// <summary>Data da próxima troca que veio na OS/etiqueta. null = o sistema calcula pelo intervalo.</summary>
    public DateTime? DataProximaTroca { get; set; }

    /// <summary>Km do caminhão na troca. Se for maior que o km cadastrado, atualiza o caminhão.</summary>
    public int KmAtual { get; set; }

    /// <summary>Km da próxima troca que veio na OS/etiqueta. 0 = o sistema calcula pelo intervalo.</summary>
    public int KmProximaTroca { get; set; }

    public bool IsPrimeiraTroca { get; set; }

    /// <summary>Mecânico que fez a troca (id do cadastro de mecânicos).</summary>
    [Required(ErrorMessage = "Escolha o mecânico que fez a troca.")]
    public long MecanicoId { get; set; }

    /// <summary>Motorista que estava com o caminhão (id do acesso). Opcional; ao lançar, vira o motorista atual do caminhão.</summary>
    public string? MotoristaId { get; set; }

    public string? Observacao { get; set; }

    public string? Concessionaria { get; set; }
}

public class ManutencaoResponseDto
{
    /// <summary>Número da OS.</summary>
    public long Id { get; set; }
    public VeiculoResumoDto Veiculo { get; set; }
    public TipoManutencaoResumoDto TipoManutencao { get; set; }
    public DateTime RealizadoEm { get; set; }
    public DateTime? DataProximaTroca { get; set; }
    public int KmAtual { get; set; }
    public int KmProximaTroca { get; set; }
    public bool IsPrimeiraTroca { get; set; }

    /// <summary>Mecânico que fez a troca.</summary>
    public MecanicoResumoDto Mecanico { get; set; }

    /// <summary>Motorista que estava com o caminhão.</summary>
    public UsuarioResumoDto? Motorista { get; set; }

    public string? Observacao { get; set; }
    public string? Concessionaria { get; set; }

    /// <summary>Quem lançou a OS no sistema.</summary>
    public UsuarioResumoDto? LancadoPor { get; set; }

    /// <summary>Data e hora em que a OS foi lançada no sistema.</summary>
    public DateTime LancadoEm { get; set; }

    public DateTime? AtualizadoEm { get; set; }
}

public static class ManutencaoDtoExtensions
{
    public static ManutencaoResponseDto ToResponseDto(this Manutencao entidade) => new()
    {
        Id = entidade.Id,
        Veiculo = entidade.Veiculo?.ToResumoDto(),
        TipoManutencao = entidade.TipoManutencao?.ToResumoDto(),
        RealizadoEm = entidade.RealizadoEm,
        DataProximaTroca = entidade.DataProximaTroca,
        KmAtual = entidade.KmAtual,
        KmProximaTroca = entidade.KmProximaTroca,
        IsPrimeiraTroca = entidade.IsPrimeiraTroca,
        Mecanico = entidade.Mecanico?.ToResumoDto(),
        Motorista = entidade.Motorista?.ToResumoDto(),
        Observacao = entidade.Observacao,
        Concessionaria = entidade.Concessionaria,
        LancadoPor = entidade.LancadoPor?.ToResumoDto(),
        LancadoEm = entidade.CriadoEm,
        AtualizadoEm = entidade.AtualizadoEm
    };

    public static Manutencao ToEntity(
        this ManutencaoRequestDto dto, Veiculo veiculo, TipoManutencao tipoManutencao, Mecanico mecanico, Usuario? motorista) => new()
    {
        Veiculo = veiculo,
        TipoManutencao = tipoManutencao,
        Mecanico = mecanico,
        Motorista = motorista,
        RealizadoEm = dto.RealizadoEm,
        DataProximaTroca = dto.DataProximaTroca,
        KmAtual = dto.KmAtual,
        KmProximaTroca = dto.KmProximaTroca,
        IsPrimeiraTroca = dto.IsPrimeiraTroca,
        Observacao = dto.Observacao,
        Concessionaria = dto.Concessionaria
    };
}
