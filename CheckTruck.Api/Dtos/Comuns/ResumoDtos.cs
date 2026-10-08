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

public class ModeloResumoDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
}

public class GeracaoResumoDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
}

public class PotenciaResumoDto
{
    public long Id { get; set; }
    public int Cv { get; set; }
}

public class VeiculoResumoDto
{
    public long Id { get; set; }
    public string Placa { get; set; }
}

public class UsuarioResumoDto
{
    public string Id { get; set; }
    public string Nome { get; set; }
}

public class MecanicoResumoDto
{
    public long Id { get; set; }
    public string Nome { get; set; }
    public string Funcao { get; set; }
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
    public static ModeloResumoDto ToResumoDto(this Modelo entidade) => new() { Id = entidade.Id, Nome = entidade.Nome };
    public static GeracaoResumoDto ToResumoDto(this Geracao entidade) => new() { Id = entidade.Id, Nome = entidade.Nome };
    public static PotenciaResumoDto ToResumoDto(this Potencia entidade) => new() { Id = entidade.Id, Cv = entidade.Cv };
    public static VeiculoResumoDto ToResumoDto(this Veiculo entidade) => new() { Id = entidade.Id, Placa = entidade.Placa };
    public static UsuarioResumoDto ToResumoDto(this Usuario entidade) => new() { Id = entidade.Id, Nome = entidade.Nome };
    public static MecanicoResumoDto ToResumoDto(this Mecanico entidade) => new() { Id = entidade.Id, Nome = entidade.Nome, Funcao = entidade.Funcao };
    public static TipoManutencaoResumoDto ToResumoDto(this TipoManutencao entidade) => new() { Id = entidade.Id, Nome = entidade.Nome };
}
