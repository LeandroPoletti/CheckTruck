using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;

namespace CheckTruck.Api.Dtos.Chamados;

/// <summary>O que dá para mudar num chamado: tipo, urgência e descrição.</summary>
public class ChamadoRequestDto
{
    [Required(ErrorMessage = "Escolha o tipo da ocorrência.")]
    public TipoOcorrencia? Tipo { get; set; }

    [Required(ErrorMessage = "Escolha a urgência.")]
    public UrgenciaChamado? Urgencia { get; set; }

    [Required(ErrorMessage = "Conte o que aconteceu.")]
    [StringLength(1000)]
    public string Descricao { get; set; } = "";
}

/// <summary>Ao abrir, escolhe também o caminhão (depois não muda).</summary>
public class AbrirChamadoRequestDto : ChamadoRequestDto
{
    [Required(ErrorMessage = "Escolha o caminhão.")]
    public long? VeiculoId { get; set; }
}

public class ResolverChamadoRequestDto
{
    [Required(ErrorMessage = "Conte o que foi feito.")]
    [StringLength(1000)]
    public string Solucao { get; set; } = "";
}

public class ChamadoResponseDto
{
    public long Id { get; set; }
    public VeiculoResumoDto Veiculo { get; set; } = null!;
    public TipoOcorrencia Tipo { get; set; }
    public UrgenciaChamado Urgencia { get; set; }
    public string Descricao { get; set; } = "";
    public StatusChamado Status { get; set; }
    public UsuarioResumoDto AbertoPor { get; set; } = null!;
    public DateTime AbertoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }
    public UsuarioResumoDto? AtendidoPor { get; set; }
    public DateTime? AtendidoEm { get; set; }
    public string? Solucao { get; set; }
    public DateTime? ConcluidoEm { get; set; }
}

public static class ChamadoDtoExtensions
{
    // Montada direto na consulta: o banco já devolve placa e nomes, sem carregar as entidades
    public static readonly Expression<Func<Chamado, ChamadoResponseDto>> Projecao = c => new ChamadoResponseDto
    {
        Id = c.Id,
        Veiculo = new VeiculoResumoDto { Id = c.Veiculo.Id, Placa = c.Veiculo.Placa },
        Tipo = c.Tipo,
        Urgencia = c.Urgencia,
        Descricao = c.Descricao,
        Status = c.Status,
        AbertoPor = new UsuarioResumoDto { Id = c.AbertoPor.Id, Nome = c.AbertoPor.Nome },
        AbertoEm = c.AbertoEm,
        AtualizadoEm = c.AtualizadoEm,
        AtendidoPor = c.AtendidoPor == null ? null : new UsuarioResumoDto { Id = c.AtendidoPor.Id, Nome = c.AtendidoPor.Nome },
        AtendidoEm = c.AtendidoEm,
        Solucao = c.Solucao,
        ConcluidoEm = c.ConcluidoEm
    };

    public static Chamado ToEntity(this ChamadoRequestDto dto) => new()
    {
        Tipo = dto.Tipo!.Value,
        Urgencia = dto.Urgencia!.Value,
        Descricao = dto.Descricao
    };
}
