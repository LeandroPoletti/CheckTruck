using CheckTruck.Dominio.Enums;

namespace CheckTruck.Dominio.Resultados;

/// <summary>
/// Intervalo que vale para um caminhão e um tipo de manutenção, depois de aplicar a prioridade
/// caminhão → geração → padrão seguro.
/// </summary>
/// <param name="IntervaloKm">Km entre trocas.</param>
/// <param name="IntervaloMeses">Meses entre trocas; 0 = vence só por km.</param>
/// <param name="IntervaloKmPrimeira">Km da primeira troca (amaciamento); 0 = igual ao intervalo normal.</param>
/// <param name="Origem">De onde o intervalo veio.</param>
public record IntervaloResolvido(int IntervaloKm, int IntervaloMeses, int IntervaloKmPrimeira, OrigemIntervalo Origem);
