using CheckTruck.Dominio.Enums;

namespace CheckTruck.Dominio.Resultados;

/// <summary>
/// Um intervalo que existe para um item, e de onde ele vem. Na lista de um item (IntervalosPadrao.EmOrdem),
/// o primeiro é o que vale.
/// </summary>
/// <param name="Origem">De onde veio: do caminhão, da empresa, de fábrica ou o padrão do sistema.</param>
/// <param name="IntervaloKm">Km entre trocas.</param>
/// <param name="IntervaloMeses">Meses entre trocas; 0 = vence só por km.</param>
/// <param name="IntervaloKmPrimeira">Km da primeira troca (amaciamento); 0 = igual ao intervalo normal.</param>
/// <param name="Id">Id do cadastro (intervalo do caminhão ou da geração); null no padrão do sistema.</param>
/// <param name="Fonte">De onde veio o número (ex.: manual do fabricante). Só no intervalo da geração.</param>
/// <param name="Observacao">Observação do cadastro.</param>
public record IntervaloResolvido(
    OrigemIntervalo Origem,
    int IntervaloKm,
    int IntervaloMeses,
    int IntervaloKmPrimeira = 0,
    long? Id = null,
    string? Fonte = null,
    string? Observacao = null);
