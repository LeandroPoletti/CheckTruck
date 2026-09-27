using CheckTruck.Dominio.Enums;

namespace CheckTruck.Api.Dtos.Comuns;

public static class StatusManutencaoExtensions
{
    /// <summary>Formato usado pelo front: "ok", "atencao" ou "critico".</summary>
    public static string ToApiString(this StatusManutencao status) => status switch
    {
        StatusManutencao.Critico => "critico",
        StatusManutencao.Atencao => "atencao",
        _ => "ok"
    };
}
