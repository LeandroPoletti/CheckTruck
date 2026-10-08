using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

/// <summary>Tração do caminhão (rodas no chão × rodas com tração): 4x2, 6x2, 6x4, 8x2 ou 8x4.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<Tracao>))]
public enum Tracao
{
    QuatroPorDois = 1,
    SeisPorDois = 2,
    SeisPorQuatro = 3,
    OitoPorDois = 4,
    OitoPorQuatro = 5,
}
