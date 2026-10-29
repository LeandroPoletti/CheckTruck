using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Ordem de serviço lançada no sistema: num dia e num km do caminhão, um ou mais mecânicos trocaram
/// um ou mais itens. Cada item trocado, com a próxima troca dele, fica em <see cref="ItemOrdemServico"/>.
/// </summary>
public class OrdemServico : EntidadeDaEmpresa, EntidadeComVersao
{
    public long Id { get; set; }
    public uint Versao { get; set; }
    /// <summary>Número da OS na empresa: 1, 2, 3... (cada empresa tem a sua sequência). Gerado ao lançar.</summary>
    public int Numero { get; set; }
    public Veiculo Veiculo { get; set; } = null!;
    public DateTime RealizadoEm { get; set; } = DateTime.UtcNow;
    /// <summary>Km do caminhão na troca.</summary>
    public int KmAtual { get; set; }
    /// <summary>O que foi trocado: um item por tipo de manutenção.</summary>
    public IList<ItemOrdemServico> Itens { get; set; } = new List<ItemOrdemServico>();
    /// <summary>Quem fez as trocas (pelo menos um). Quem fez o quê, se precisar, vai na observação.</summary>
    public IList<Mecanico> Mecanicos { get; set; } = new List<Mecanico>();
    /// <summary>Motorista que estava com o caminhão (opcional). Ao lançar a OS, ele vira o motorista atual do caminhão.</summary>
    public Usuario? Motorista { get; set; }
    public string? Observacao { get; set; }
    public string? Concessionaria { get; set; }
    /// <summary>Quem lançou a OS: a API preenche com quem está logado. OS antigas podem estar sem.</summary>
    public Usuario? LancadoPor { get; set; }
    /// <summary>Data e hora em que a OS foi lançada no sistema.</summary>
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }
}
