using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;

namespace CheckTruck.Api.Dtos.Veiculos;

public class VeiculoRequestDto
{
    [Required]
    public string Placa { get; set; }

    /// <summary>Potência do caminhão (da geração escolhida). Dela vêm a geração, o modelo e o fabricante.</summary>
    [Required]
    public long PotenciaId { get; set; }

    public Tracao Tracao { get; set; }

    [StringLength(17, MinimumLength = 17), Required]
    public string Chassi { get; set; }

    public string Renavam { get; set; }
    public DateTime AnoModelo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }

    /// <summary>Acesso com cargo Motorista que está com o caminhão agora. Opcional.</summary>
    public string? MotoristaAtualId { get; set; }
}

public class VeiculoResponseDto
{
    public long Id { get; set; }
    public string Placa { get; set; }
    public FabricanteResumoDto? Fabricante { get; set; }
    public ModeloResumoDto? Modelo { get; set; }
    public GeracaoResumoDto? Geracao { get; set; }
    public PotenciaResumoDto? Potencia { get; set; }
    public Tracao Tracao { get; set; }
    public string Chassi { get; set; }
    public string Renavam { get; set; }
    public DateTime AnoModelo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }
    public UsuarioResumoDto? MotoristaAtual { get; set; }
}

public static class VeiculoDtoExtensions
{
    /// <summary>Fabricante, modelo e geração só vêm quando a consulta inclui a potência com a geração.</summary>
    public static VeiculoResponseDto ToResponseDto(this Veiculo entidade) => new()
    {
        Id = entidade.Id,
        Placa = entidade.Placa,
        Fabricante = entidade.Potencia?.Geracao?.Modelo?.Fabricante?.ToResumoDto(),
        Modelo = entidade.Potencia?.Geracao?.Modelo?.ToResumoDto(),
        Geracao = entidade.Potencia?.Geracao?.ToResumoDto(),
        Potencia = entidade.Potencia?.ToResumoDto(),
        Tracao = entidade.Tracao,
        Chassi = entidade.Chassi,
        Renavam = entidade.Renavam,
        AnoModelo = entidade.AnoModelo,
        AnoFabricacao = entidade.AnoFabricacao,
        KmAtual = entidade.KmAtual,
        Ativo = entidade.Ativo,
        MotoristaAtual = entidade.MotoristaAtual?.ToResumoDto()
    };

    public static Veiculo ToEntity(this VeiculoRequestDto dto, Potencia potencia, Usuario? motoristaAtual) => new()
    {
        Placa = dto.Placa,
        Potencia = potencia,
        Tracao = dto.Tracao,
        Chassi = dto.Chassi,
        Renavam = dto.Renavam,
        AnoModelo = dto.AnoModelo,
        AnoFabricacao = dto.AnoFabricacao,
        KmAtual = dto.KmAtual,
        Ativo = dto.Ativo,
        MotoristaAtual = motoristaAtual
    };
}
