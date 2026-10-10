namespace CheckTruck.Dominio.Enums;

/// <summary>De onde vem um intervalo de troca. A ordem em que eles valem fica em IntervalosPadrao.EmOrdem.</summary>
public enum OrigemIntervalo
{
    /// <summary>Padrão seguro do sistema (por componente e norma de emissão).</summary>
    Padrao = 0,
    /// <summary>Intervalo de fábrica da geração (IntervaloRecomendado do catálogo do sistema).</summary>
    Fabrica = 1,
    /// <summary>Intervalo próprio do caminhão (IntervaloVeiculo).</summary>
    Veiculo = 2,
    /// <summary>Intervalo que a empresa cadastrou para a geração: vale antes do de fábrica.</summary>
    Empresa = 3,
}
