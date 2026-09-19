using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Modelos;

public class ModeloRequestDto
{
    [Required]
    public string Nome { get; set; }

    [Required]
    public long GeracaoId { get; set; }

    public int PotenciaCavalo { get; set; }
    public int EixoDianteiroPneus { get; set; }
    public int EixoTraseiroTandem { get; set; }
    public int PneusPorEixoTraseiro { get; set; }
}

public class ModeloResponseDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public GeracaoModeloResumoDto Geracao { get; set; }
    public int PotenciaCavalo { get; set; }
    public int EixoDianteiroPneus { get; set; }
    public int EixoTraseiroTandem { get; set; }
    public int PneusPorEixoTraseiro { get; set; }
}

public static class ModeloDtoExtensions
{
    public static ModeloResponseDto ToResponseDto(this Modelo entidade) => new()
    {
        Id = entidade.Id,
        Nome = entidade.Nome,
        Geracao = entidade.Geracao?.ToResumoDto(),
        PotenciaCavalo = entidade.PotenciaCavalo,
        EixoDianteiroPneus = entidade.EixoDianteiroPneus,
        EixoTraseiroTandem = entidade.EixoTraseiroTandem,
        PneusPorEixoTraseiro = entidade.PneusPorEixoTraseiro
    };

    public static Modelo ToEntity(this ModeloRequestDto dto, GeracaoModelo geracao) => new()
    {
        Nome = dto.Nome,
        Geracao = geracao,
        PotenciaCavalo = dto.PotenciaCavalo,
        EixoDianteiroPneus = dto.EixoDianteiroPneus,
        EixoTraseiroTandem = dto.EixoTraseiroTandem,
        PneusPorEixoTraseiro = dto.PneusPorEixoTraseiro
    };
}
