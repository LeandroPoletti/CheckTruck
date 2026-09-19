using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Veiculos;

public class VeiculoRequestDto
{
    [Required]
    public string Placa { get; set; }

    [Required]
    public long ModeloId { get; set; }

    [StringLength(17, MinimumLength = 17), Required]
    public string Chassi { get; set; }

    public string Renavam { get; set; }
    public DateTime AnoModelo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }

    [Required]
    public long MotoristaId { get; set; }
}

public class VeiculoResponseDto
{
    public long Id { get; set; }
    public string Placa { get; set; }
    public ModeloResumoDto Modelo { get; set; }
    public string Chassi { get; set; }
    public string Renavam { get; set; }
    public DateTime AnoModelo { get; set; }
    public DateTime AnoFabricacao { get; set; }
    public int KmAtual { get; set; }
    public bool Ativo { get; set; }
    public MotoristaResumoDto Motorista { get; set; }
}

public static class VeiculoDtoExtensions
{
    public static VeiculoResponseDto ToResponseDto(this Veiculo entidade) => new()
    {
        Id = entidade.Id,
        Placa = entidade.Placa,
        Modelo = entidade.Modelo?.ToResumoDto(),
        Chassi = entidade.Chassi,
        Renavam = entidade.Renavam,
        AnoModelo = entidade.AnoModelo,
        AnoFabricacao = entidade.AnoFabricacao,
        KmAtual = entidade.KmAtual,
        Ativo = entidade.Ativo,
        Motorista = entidade.Motorista?.ToResumoDto()
    };

    public static Veiculo ToEntity(this VeiculoRequestDto dto, Modelo modelo, Motorista motorista) => new()
    {
        Placa = dto.Placa,
        Modelo = modelo,
        Chassi = dto.Chassi,
        Renavam = dto.Renavam,
        AnoModelo = dto.AnoModelo,
        AnoFabricacao = dto.AnoFabricacao,
        KmAtual = dto.KmAtual,
        Ativo = dto.Ativo,
        Motorista = motorista
    };
}
