using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

/// <summary>
/// Norma de emissão da geração. No Brasil o Euro 5 (Proconve P7) vale desde 2012 e o Euro 6
/// (Proconve P8) desde 2023. Muda o padrão seguro do óleo do motor (IntervalosPadrao).
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<NormaEmissao>))]
public enum NormaEmissao
{
    AntesDoEuro5 = 1,
    Euro5 = 2,
    Euro6 = 3,
}
