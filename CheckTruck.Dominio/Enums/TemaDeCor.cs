using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

/// <summary>Cor do site e do app que cada pessoa escolhe para si (fica na conta, vale nos dois). Verde é o padrão.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<TemaDeCor>))]
public enum TemaDeCor
{
    Verde = 0,
    Azul = 1,
    Amarelo = 2,
    Preto = 3,
}
