using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Regras dos chamados. Quem abriu edita e exclui enquanto está pendente; Admin e Gestor mexem em qualquer um.
/// Atender grava quem está cuidando (continua pendente) e resolver conclui com o que foi feito.
/// </summary>
public class ServicoChamado(
    IRepositorioCrud repositorioCrud,
    ServicoCrud<Veiculo> servicoVeiculo,
    ILogger<ServicoChamado> logger) : ServicoCrud<Chamado>(repositorioCrud, logger)
{
    // Dono, quem atende e status de um chamado, sem carregar o chamado inteiro
    private record EstadoChamado(string AbertoPorId, string? AtendidoPorId, StatusChamado Status);

    /// <summary>Quem só abre chamado vê os próprios; quem atende vê todos. Do mais novo para o mais velho.</summary>
    public IQueryable<Chamado> Listar(Usuario quem)
    {
        var chamados = Query(_ => true);
        if (!quem.Pode(Permissao.AtenderChamados))
        {
            chamados = chamados.Where(c => c.AbertoPor.Id == quem.Id);
        }

        return chamados.OrderByDescending(c => c.AbertoEm);
    }

    /// <summary>Caminhões que podem receber chamado (os ativos), por placa.</summary>
    public IQueryable<Veiculo> ListarVeiculosAtivos() =>
        servicoVeiculo.Query(v => v.Ativo).OrderBy(v => v.Placa);

    public override bool Valida(Chamado entidade)
    {
        entidade.Descricao = entidade.Descricao.Trim();
        if (!Enum.IsDefined(entidade.Tipo))
        {
            Mensagens.Add("Escolha o tipo da ocorrência.");
        }

        if (!Enum.IsDefined(entidade.Urgencia))
        {
            Mensagens.Add("Escolha a urgência.");
        }

        if (entidade.Descricao.Length == 0)
        {
            Mensagens.Add("Conte o que aconteceu.");
        }

        return base.Valida(entidade);
    }

    public Chamado? Abrir(Usuario quem, long veiculoId, Chamado novo)
    {
        var veiculo = servicoVeiculo.GetById(veiculoId);
        if (veiculo is not { Ativo: true })
        {
            Mensagens.Add("Caminhão não encontrado ou desativado.");
            return null;
        }

        novo.Veiculo = veiculo;
        novo.AbertoPor = quem;
        novo.AbertoEm = DateTime.UtcNow;
        novo.Status = StatusChamado.Pendente;

        // O motorista que abre o chamado é quem está com o caminhão agora
        if (quem.Cargo == Cargo.Motorista)
        {
            veiculo.MotoristaAtual = quem;
        }

        return Inserir(novo);
    }

    /// <param name="dados">Tipo, urgência e descrição novos (o caminhão não muda).</param>
    public Chamado? Editar(Usuario quem, long id, Chamado dados)
    {
        if (!PodeAlterar(quem, id))
        {
            return null;
        }

        var chamado = GetById(id)!;
        chamado.Tipo = dados.Tipo;
        chamado.Urgencia = dados.Urgencia;
        chamado.Descricao = dados.Descricao;
        chamado.AtualizadoEm = DateTime.UtcNow;
        return Atualizar(chamado);
    }

    public bool Excluir(Usuario quem, long id) => PodeAlterar(quem, id) && Deletar(id) is not null;

    public Chamado? Atender(Usuario quem, long id)
    {
        var estado = ObterPendente(id);
        if (estado is null)
        {
            return null;
        }

        var chamado = GetById(id)!;
        chamado.AtendidoPor = quem;
        chamado.AtendidoEm = DateTime.UtcNow;
        return Atualizar(chamado);
    }

    public Chamado? Resolver(Usuario quem, long id, string? solucao)
    {
        var estado = ObterPendente(id);
        if (estado is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(solucao))
        {
            Mensagens.Add("Conte o que foi feito.");
            return null;
        }

        var chamado = GetById(id)!;
        // Resolveu sem ninguém atendendo: quem resolveu fica como quem atendeu
        if (estado.AtendidoPorId is null)
        {
            chamado.AtendidoPor = quem;
            chamado.AtendidoEm = DateTime.UtcNow;
        }

        chamado.Solucao = solucao.Trim();
        chamado.Status = StatusChamado.Concluido;
        chamado.ConcluidoEm = DateTime.UtcNow;
        return Atualizar(chamado);
    }

    private EstadoChamado? ObterEstado(long id) =>
        Query(c => c.Id == id)
            .Select(c => new EstadoChamado(c.AbertoPor.Id, c.AtendidoPor == null ? null : c.AtendidoPor.Id, c.Status))
            .FirstOrDefault();

    private EstadoChamado? ObterPendente(long id)
    {
        var estado = ObterEstado(id);
        if (estado is null)
        {
            Mensagens.Add("Chamado não encontrado.");
            return null;
        }

        if (estado.Status != StatusChamado.Pendente)
        {
            Mensagens.Add("Esse chamado já foi concluído.");
            return null;
        }

        return estado;
    }

    // Quem abriu mexe enquanto está pendente; Admin e Gestor mexem sempre
    private bool PodeAlterar(Usuario quem, long id)
    {
        var estado = ObterEstado(id);
        if (estado is null)
        {
            Mensagens.Add("Chamado não encontrado.");
            return false;
        }

        if (!quem.CuidaDosAcessos && (estado.AbertoPorId != quem.Id || estado.Status != StatusChamado.Pendente))
        {
            Mensagens.Add("Só quem abriu pode editar ou excluir, e só enquanto está pendente.");
            return false;
        }

        return true;
    }
}
