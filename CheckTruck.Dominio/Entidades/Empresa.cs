using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Cliente do CheckTruck. Cada empresa só vê os próprios caminhões, OS, chamados, mecânicos e acessos;
/// o catálogo do sistema é de todas, e o que a empresa cadastra nele só ela vê.
/// </summary>
public class Empresa : EntidadeBanco
{
    public long Id { get; set; }

    /// <summary>Frota: nome da empresa. Autônomo: nome da pessoa.</summary>
    public string Nome { get; set; } = "";

    public TipoConta TipoConta { get; set; }

    /// <summary>Sem máscara: CNPJ na frota, CPF no autônomo. Não repete. A empresa do TCC fica sem.</summary>
    public string? Documento { get; set; }
}
