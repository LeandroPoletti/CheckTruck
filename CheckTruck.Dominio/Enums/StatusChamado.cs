using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

/// <summary>O chamado fica pendente (mesmo com alguém atendendo) até alguém resolver.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<StatusChamado>))]
public enum StatusChamado
{
    Pendente = 1,
    Concluido = 2,
}
