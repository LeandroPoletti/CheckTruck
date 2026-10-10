using CheckTruck.Dominio.Resultados;

namespace CheckTruck.Api.Dtos.Comuns;

/// <summary>Uma linha da tela Intervalos: o item e os intervalos que existem para ele, na ordem em que valem.</summary>
public class IntervalosDoItemResponseDto
{
    public long TipoManutencaoId { get; set; }

    /// <summary>O primeiro é o que vale; sem ele, vale o seguinte. Vazio = o item não é acompanhado.</summary>
    public IList<IntervaloEmOrdemDto> EmOrdem { get; set; } = [];
}

public class IntervaloEmOrdemDto
{
    /// <summary>"caminhao", "empresa", "fabrica" ou "padrao".</summary>
    public string Origem { get; set; } = "";

    /// <summary>Id do cadastro (intervalo do caminhão ou da geração); null no padrão do sistema.</summary>
    public long? Id { get; set; }

    public int IntervaloKm { get; set; }

    /// <summary>Km da primeira troca (amaciamento); 0 = igual ao intervalo.</summary>
    public int IntervaloKmPrimeira { get; set; }

    /// <summary>Prazo máximo entre trocas, em meses; 0 = só por km.</summary>
    public int IntervaloMeses { get; set; }

    public string? Fonte { get; set; }
    public string? Observacao { get; set; }
}

public static class IntervalosDoItemDtoExtensions
{
    public static IntervalosDoItemResponseDto ToResponseDto(this IntervalosDoItem linha) => new()
    {
        TipoManutencaoId = linha.TipoManutencaoId,
        EmOrdem = linha.EmOrdem.Select(i => new IntervaloEmOrdemDto
        {
            Origem = i.Origem.ToApiString(),
            Id = i.Id,
            IntervaloKm = i.IntervaloKm,
            IntervaloKmPrimeira = i.IntervaloKmPrimeira,
            IntervaloMeses = i.IntervaloMeses,
            Fonte = i.Fonte,
            Observacao = i.Observacao
        }).ToList()
    };
}
