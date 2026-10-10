namespace CheckTruck.Dominio.Resultados;

/// <summary>Uma linha da tela Intervalos: o item e os intervalos que existem para ele, na ordem em que valem.</summary>
public record IntervalosDoItem(long TipoManutencaoId, IList<IntervaloResolvido> EmOrdem);
