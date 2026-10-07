using System.Text.Json.Serialization;

namespace CheckTruck.Dominio.Enums;

/// <summary>
/// O que cada acesso pode fazer. O admin ou o gestor liga e desliga uma por uma no cadastro.
/// No banco ficam todas juntas num número só (cada permissão é um bit).
/// </summary>
[Flags]
[JsonConverter(typeof(JsonStringEnumConverter<Permissao>))]
public enum Permissao
{
    Nenhuma = 0,

    /// <summary>Dashboard, lista e detalhe dos veículos (e o histórico de OS).</summary>
    VerFrota = 1 << 0,

    /// <summary>Cadastrar e editar veículos.</summary>
    Veiculos = 1 << 1,

    AtualizarKm = 1 << 2,

    /// <summary>Lançar e editar ordens de serviço.</summary>
    OrdemServico = 1 << 3,

    /// <summary>País, fabricante, geração, modelo e mecânicos da OS.</summary>
    Cadastros = 1 << 4,

    /// <summary>Intervalos de troca.</summary>
    Intervalos = 1 << 5,

    /// <summary>Abrir chamado e editar os próprios enquanto estão pendentes.</summary>
    AbrirChamados = 1 << 6,

    /// <summary>Ver todos os chamados, atender e resolver.</summary>
    AtenderChamados = 1 << 7,
}
