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

    /// <summary>De onde veio o intervalo, com as palavras da tela: "caminhao", "empresa", "fabrica" ou "padrao".</summary>
    public static string ToApiString(this OrigemIntervalo origem) => origem switch
    {
        OrigemIntervalo.Veiculo => "caminhao",
        OrigemIntervalo.Empresa => "empresa",
        OrigemIntervalo.Fabrica => "fabrica",
        _ => "padrao"
    };
}
