namespace CheckTruck.Api.Dtos.Comuns;

/// <summary>
/// O começo de uma lista que cresce sempre (OS da frota, chamados concluídos, histórico de km): os mais novos e
/// quantos existem no total. Para ver mais, a tela pede de novo com um quantos maior.
/// </summary>
public class PaginaDto<T>
{
    public IList<T> Itens { get; set; } = [];
    public int Total { get; set; }
}

public static class Paginacao
{
    /// <summary>Quantos vêm quando a tela não diz.</summary>
    public const int Padrao = 50;

    /// <summary>O máximo de uma vez. Acima disso, a tela pede para usar a busca ou o período.</summary>
    public const int Maximo = 500;

    /// <summary>Os primeiros da consulta (já na ordem da tela) e o total. quantos 0 traz só o total.</summary>
    public static PaginaDto<TDto> Pagina<T, TDto>(this IQueryable<T> consulta, int quantos,
        Func<IQueryable<T>, IEnumerable<TDto>> paraDto) => new()
    {
        Total = consulta.Count(),
        Itens = quantos <= 0 ? [] : paraDto(consulta.Take(Math.Min(quantos, Maximo))).ToList(),
    };
}
