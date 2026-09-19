using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.Comuns;

public class PaisResumoDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
}

public class FabricanteResumoDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
}

public class GeracaoModeloResumoDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
}

public class ModeloResumoDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
}

public class VeiculoResumoDto
{
    public long Id { get; set; }
    public string Placa { get; set; }
}

public class MotoristaResumoDto
{
    public long Id { get; set; }
    public string Cpf { get; set; }
}

public class TecnicoResumoDto
{
    public long Id { get; set; }
    public string Cpf { get; set; }
}

public class TipoManutencaoResumoDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
}

public static class ResumoDtoExtensions
{
    public static PaisResumoDto ToResumoDto(this Pais entidade) => new() { Id = entidade.Id, Nome = entidade.Nome };
    public static FabricanteResumoDto ToResumoDto(this Fabricante entidade) => new() { Id = entidade.Id, Nome = entidade.Nome };
    public static GeracaoModeloResumoDto ToResumoDto(this GeracaoModelo entidade) => new() { Id = entidade.Id, Nome = entidade.Nome };
    public static ModeloResumoDto ToResumoDto(this Modelo entidade) => new() { Id = entidade.Id, Nome = entidade.Nome };
    public static VeiculoResumoDto ToResumoDto(this Veiculo entidade) => new() { Id = entidade.Id, Placa = entidade.Placa };
    public static MotoristaResumoDto ToResumoDto(this Motorista entidade) => new() { Id = entidade.Id, Cpf = entidade.Cpf };
    public static TecnicoResumoDto ToResumoDto(this Tecnico entidade) => new() { Id = entidade.Id, Cpf = entidade.Cpf };
    public static TipoManutencaoResumoDto ToResumoDto(this TipoManutencao entidade) => new() { Id = entidade.Id, Nome = entidade.Nome };
}
