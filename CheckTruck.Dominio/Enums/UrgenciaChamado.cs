using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

[JsonConverter(typeof(JsonStringEnumConverter<UrgenciaChamado>))]
public enum UrgenciaChamado
{
    Baixa = 1,
    Media = 2,
    Alta = 3,
}
