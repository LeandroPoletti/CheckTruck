using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

/// <summary>O que o motorista acha que está acontecendo com o caminhão (escolhido ao abrir o chamado).</summary>
[JsonConverter(typeof(JsonStringEnumConverter<TipoOcorrencia>))]
public enum TipoOcorrencia
{
    RuidoMotor = 1,
    Freios = 2,
    PneuSuspensao = 3,
    EletricaPainel = 4,
    Vazamento = 5,
    ArCondicionado = 6,
    PreventivaVencida = 7,
    Outro = 8,
}
