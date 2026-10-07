using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

/// <summary>
/// Cargo de quem entra no sistema. Admin e Gestor podem tudo e são os únicos que cuidam dos acessos;
/// os outros só fazem o que o admin ou o gestor liberar (ver <see cref="Permissao"/>).
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<Cargo>))]
public enum Cargo
{
    Admin = 1,
    Gestor = 2,
    Almoxarife = 3,
    Mecanico = 4,
    ChefeManutencao = 5,
    TecnicoLogistica = 6,
    AuxiliarLogistica = 7,
    Motorista = 8,
}
