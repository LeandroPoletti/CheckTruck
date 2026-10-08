using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Dominio.Entidades;

/// <summary>
/// Reclamação do motorista (ou de quem tem a permissão) sobre um caminhão, para o mecânico ir ver.
/// Fica pendente até alguém resolver e contar o que foi feito.
/// </summary>
public class Chamado : EntidadeBanco
{
    public long Id { get; set; }
    public Veiculo Veiculo { get; set; } = null!;
    public TipoOcorrencia Tipo { get; set; }
    public UrgenciaChamado Urgencia { get; set; }
    public string Descricao { get; set; } = "";
    public StatusChamado Status { get; set; } = StatusChamado.Pendente;

    public Usuario AbertoPor { get; set; } = null!;
    public DateTime AbertoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    /// <summary>Quem está cuidando do chamado. Quem resolve sem ninguém atendendo fica gravado aqui.</summary>
    public Usuario? AtendidoPor { get; set; }
    public DateTime? AtendidoEm { get; set; }

    /// <summary>O que foi feito para resolver. Obrigatório ao concluir.</summary>
    public string? Solucao { get; set; }
    public DateTime? ConcluidoEm { get; set; }
}
