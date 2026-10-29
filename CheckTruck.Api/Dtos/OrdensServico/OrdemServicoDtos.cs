using System.ComponentModel.DataAnnotations;
using CheckTruck.Api.Dtos.Comuns;
using CheckTruck.Dominio.Entidades;

namespace CheckTruck.Api.Dtos.OrdensServico;

public class OrdemServicoRequestDto
{
    [Required]
    public long VeiculoId { get; set; }

    public DateTime RealizadoEm { get; set; } = DateTime.UtcNow;

    /// <summary>Km do caminhão na troca. Se for maior que o km cadastrado, atualiza o caminhão.</summary>
    public int KmAtual { get; set; }

    /// <summary>O que foi trocado: pelo menos um item, e cada tipo de manutenção uma vez só.</summary>
    public IList<ItemOrdemServicoRequestDto> Itens { get; set; } = [];

    /// <summary>Quem fez as trocas (ids do cadastro de mecânicos): pelo menos um.</summary>
    public IList<long> MecanicoIds { get; set; } = [];

    /// <summary>Motorista que estava com o caminhão (id do acesso). Opcional; ao lançar, vira o motorista atual do caminhão.</summary>
    public string? MotoristaId { get; set; }

    [MaxLength(500, ErrorMessage = "As observações podem ter até 500 caracteres.")]
    public string? Observacao { get; set; }

    [MaxLength(150, ErrorMessage = "A concessionária ou oficina pode ter até 150 caracteres.")]
    public string? Concessionaria { get; set; }

    /// <summary>Na correção: a versão que veio quando a OS foi aberta. Se alguém salvou antes, nada é gravado.</summary>
    public uint Versao { get; set; }
}

public class ItemOrdemServicoRequestDto
{
    [Required]
    public long TipoManutencaoId { get; set; }

    /// <summary>Km da próxima troca que veio na OS/etiqueta. 0 = o sistema calcula pelo intervalo.</summary>
    public int KmProximaTroca { get; set; }

    /// <summary>Data da próxima troca que veio na OS/etiqueta. null = o sistema calcula pelo intervalo.</summary>
    public DateTime? DataProximaTroca { get; set; }

    public bool IsPrimeiraTroca { get; set; }
}

/// <summary>Filtros da lista de OS da frota (todos opcionais) e quantas OS vêm (50 se não disser).</summary>
public class FiltroDasOrdensDto
{
    public long? TipoId { get; set; }

    /// <summary>Placa (com ou sem hífen) ou número da OS.</summary>
    public string? Busca { get; set; }

    /// <summary>Primeiro dia do período da troca (aaaa-mm-dd).</summary>
    public DateOnly? De { get; set; }

    /// <summary>Último dia do período da troca (aaaa-mm-dd).</summary>
    public DateOnly? Ate { get; set; }

    public int Quantos { get; set; } = Paginacao.Padrao;
}

public class OrdemServicoResponseDto
{
    public long Id { get; set; }

    /// <summary>Número da OS na empresa (1, 2, 3...).</summary>
    public int Numero { get; set; }
    public VeiculoResumoDto? Veiculo { get; set; }
    public DateTime RealizadoEm { get; set; }
    public int KmAtual { get; set; }

    /// <summary>O que foi trocado, cada item com a próxima troca dele.</summary>
    public IList<ItemOrdemServicoResponseDto> Itens { get; set; } = [];

    /// <summary>Quem fez as trocas.</summary>
    public IList<MecanicoResumoDto> Mecanicos { get; set; } = [];

    /// <summary>Motorista que estava com o caminhão.</summary>
    public UsuarioResumoDto? Motorista { get; set; }

    public string? Observacao { get; set; }
    public string? Concessionaria { get; set; }

    /// <summary>Quem lançou a OS no sistema.</summary>
    public UsuarioResumoDto? LancadoPor { get; set; }

    /// <summary>Data e hora em que a OS foi lançada no sistema.</summary>
    public DateTime LancadoEm { get; set; }

    public DateTime? AtualizadoEm { get; set; }

    /// <summary>Muda a cada gravação. Volta na correção (ver OrdemServicoRequestDto.Versao).</summary>
    public uint Versao { get; set; }
}

public class ItemOrdemServicoResponseDto
{
    public long Id { get; set; }
    public TipoManutencaoResumoDto? TipoManutencao { get; set; }
    public int KmProximaTroca { get; set; }
    public DateTime? DataProximaTroca { get; set; }
    public bool IsPrimeiraTroca { get; set; }
}

public static class OrdemServicoDtoExtensions
{
    public static OrdemServicoResponseDto ToResponseDto(this OrdemServico entidade) => new()
    {
        Id = entidade.Id,
        Numero = entidade.Numero,
        Veiculo = entidade.Veiculo?.ToResumoDto(),
        RealizadoEm = entidade.RealizadoEm,
        KmAtual = entidade.KmAtual,
        Itens = entidade.Itens
            .OrderBy(i => i.TipoManutencao?.Nome)
            .Select(i => new ItemOrdemServicoResponseDto
            {
                Id = i.Id,
                TipoManutencao = i.TipoManutencao?.ToResumoDto(),
                KmProximaTroca = i.KmProximaTroca,
                DataProximaTroca = i.DataProximaTroca,
                IsPrimeiraTroca = i.IsPrimeiraTroca
            })
            .ToList(),
        Mecanicos = entidade.Mecanicos.OrderBy(m => m.Nome).Select(m => m.ToResumoDto()).ToList(),
        Motorista = entidade.Motorista?.ToResumoDto(),
        Observacao = entidade.Observacao,
        Concessionaria = entidade.Concessionaria,
        LancadoPor = entidade.LancadoPor?.ToResumoDto(),
        LancadoEm = entidade.CriadoEm,
        AtualizadoEm = entidade.AtualizadoEm,
        Versao = entidade.Versao
    };

    /// <summary>OS nova, com o que a API já achou pelos ids (caminhão, tipos de cada item, mecânicos e motorista).</summary>
    public static OrdemServico ToEntity(this OrdemServicoRequestDto dto, Veiculo veiculo,
        IReadOnlyDictionary<long, TipoManutencao> tipos, IList<Mecanico> mecanicos, Usuario? motorista)
    {
        var ordemServico = new OrdemServico { Veiculo = veiculo };
        dto.AplicarEm(ordemServico, tipos, mecanicos, motorista);
        return ordemServico;
    }

    /// <summary>
    /// Copia o que veio para a OS. Na correção, o item de um tipo que já estava na OS continua o mesmo
    /// registro, o tipo que não veio sai e o novo entra; os mecânicos ficam os que vieram. A versão que veio é a que
    /// o banco confere ao gravar.
    /// </summary>
    public static void AplicarEm(this OrdemServicoRequestDto dto, OrdemServico ordemServico,
        IReadOnlyDictionary<long, TipoManutencao> tipos, IList<Mecanico> mecanicos, Usuario? motorista)
    {
        ordemServico.Versao = dto.Versao;
        ordemServico.RealizadoEm = dto.RealizadoEm;
        ordemServico.KmAtual = dto.KmAtual;
        ordemServico.Motorista = motorista;
        ordemServico.Observacao = dto.Observacao;
        ordemServico.Concessionaria = dto.Concessionaria;

        var tiposQueVieram = dto.Itens.Select(i => i.TipoManutencaoId).ToHashSet();
        foreach (var saiu in ordemServico.Itens.Where(i => !tiposQueVieram.Contains(i.TipoManutencao.Id)).ToList())
        {
            ordemServico.Itens.Remove(saiu);
        }

        foreach (var itemDto in dto.Itens)
        {
            var item = ordemServico.Itens.FirstOrDefault(i => i.TipoManutencao.Id == itemDto.TipoManutencaoId);
            if (item is null)
            {
                item = new ItemOrdemServico { TipoManutencao = tipos[itemDto.TipoManutencaoId] };
                ordemServico.Itens.Add(item);
            }

            item.KmProximaTroca = itemDto.KmProximaTroca;
            item.DataProximaTroca = itemDto.DataProximaTroca;
            item.IsPrimeiraTroca = itemDto.IsPrimeiraTroca;
        }

        ordemServico.Mecanicos.Clear();
        foreach (var mecanico in mecanicos)
        {
            ordemServico.Mecanicos.Add(mecanico);
        }
    }
}
