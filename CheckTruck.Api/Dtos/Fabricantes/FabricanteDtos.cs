using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Fabricantes;

public class FabricanteRequestDto
{
    [Required]
    public string Nome { get; set; }

    [Required]
    public long PaisOrigemId { get; set; }
}

public class FabricanteResponseDto
{
    public long Id { get; set; }

    /// <summary>Do catálogo do sistema (só o dono do sistema muda). false = da empresa de quem está logado.</summary>
    public bool DoSistema { get; set; }

    public string Nome { get; set; }
    public PaisResumoDto PaisOrigem { get; set; }
}

public static class FabricanteDtoExtensions
{
    public static FabricanteResponseDto ToResponseDto(this Fabricante entidade) => new()
    {
        Id = entidade.Id,
        DoSistema = entidade.EmpresaId is null,
        Nome = entidade.Nome,
        PaisOrigem = entidade.PaisOrigem?.ToResumoDto()
    };

    public static Fabricante ToEntity(this FabricanteRequestDto dto, Pais paisOrigem) => new()
    {
        Nome = dto.Nome,
        PaisOrigem = paisOrigem
    };
}
