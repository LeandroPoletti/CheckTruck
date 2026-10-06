namespace CheckTruck.Dominio.Enums;

/// <summary>De onde veio o intervalo usado no cálculo de um item.</summary>
public enum OrigemIntervalo
{
    /// <summary>Padrão seguro do sistema (por componente e norma de emissão).</summary>
    Padrao = 0,
    /// <summary>Intervalo cadastrado para o modelo (IntervaloRecomendado).</summary>
    Modelo = 1,
    /// <summary>Intervalo próprio do caminhão (IntervaloVeiculo).</summary>
    Veiculo = 2,
}
