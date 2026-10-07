using CheckTruck.Dominio.Enums;

namespace CheckTruck.Dominio.Util;

/// <summary>Conversões entre as permissões guardadas juntas (um número só) e a lista que vai e volta da API.</summary>
public static class PermissaoUtil
{
    /// <summary>Todas as permissões juntas: é o que Admin e Gestor têm.</summary>
    public static readonly Permissao Todas =
        Enum.GetValues<Permissao>().Aggregate(Permissao.Nenhuma, (todas, permissao) => todas | permissao);

    /// <summary>Permissões que ficam dentro da tela de veículos: quem tem alguma delas ganha "Ver frota" junto.</summary>
    public const Permissao DependemDeVerFrota = Permissao.Veiculos | Permissao.AtualizarKm | Permissao.OrdemServico;

    public static List<Permissao> ParaLista(Permissao permissoes) =>
        Enum.GetValues<Permissao>()
            .Where(permissao => permissao != Permissao.Nenhuma && permissoes.HasFlag(permissao))
            .ToList();

    public static Permissao Juntar(IEnumerable<Permissao> lista) =>
        lista.Aggregate(Permissao.Nenhuma, (todas, permissao) => todas | permissao);
}
