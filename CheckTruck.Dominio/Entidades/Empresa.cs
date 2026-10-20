using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Cliente do CheckTruck. Cada empresa só vê os próprios caminhões, OS, chamados, mecânicos e acessos;
/// o catálogo do sistema é de todas, e o que a empresa cadastra nele só ela vê.
/// </summary>
public class Empresa : EntidadeBanco
{
    public long Id { get; set; }

    public string Nome { get; set; } = "";

    /// <summary>
    /// Sem máscara: o CNPJ (nas contas antigas de uma pessoa só, o CPF dela). Não repete. A empresa do TCC fica sem.
    /// </summary>
    public string? Documento { get; set; }

    /// <summary>Quando o dono do sistema desativou a empresa (ninguém dela entra). null = ativa.</summary>
    public DateTime? DesativadaEm { get; set; }

    public bool Ativa => DesativadaEm is null;
}
