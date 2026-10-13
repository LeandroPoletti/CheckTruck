using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Celulares que recebem aviso (push) e o aviso de chamado novo. O app manda o token do celular ao entrar e
/// apaga ao sair. Quando alguém abre um chamado, quem pode atender chamados na mesma empresa recebe o aviso,
/// menos quem abriu. Se o aviso falhar, o chamado continua aberto: o erro fica só no log.
/// </summary>
public class ServicoCelular(
    ServicoCrud<Celular> celulares,
    IEnviadorDeAvisos enviador,
    ILogger<ServicoCelular> logger)
{
    // Os mesmos nomes do web e do app (data/chamados.js e dados/chamados.ts)
    private static readonly Dictionary<TipoOcorrencia, string> NomeDoTipo = new()
    {
        [TipoOcorrencia.RuidoMotor] = "Ruído no motor",
        [TipoOcorrencia.Freios] = "Freios",
        [TipoOcorrencia.PneuSuspensao] = "Pneu / suspensão",
        [TipoOcorrencia.EletricaPainel] = "Elétrica / painel",
        [TipoOcorrencia.Vazamento] = "Vazamento",
        [TipoOcorrencia.ArCondicionado] = "Ar-condicionado",
        [TipoOcorrencia.PreventivaVencida] = "Manutenção preventiva vencida",
        [TipoOcorrencia.Outro] = "Outro",
    };

    // A urgência Alta aparece como "Urgente" no web e no app
    private static readonly Dictionary<UrgenciaChamado, string> TextoDaUrgencia = new()
    {
        [UrgenciaChamado.Baixa] = "urgência baixa",
        [UrgenciaChamado.Media] = "urgência média",
        [UrgenciaChamado.Alta] = "urgente",
    };

    public List<string> Mensagens => celulares.Mensagens;

    /// <summary>
    /// Grava o celular para quem está logado. Se ele estava com outra pessoa (outro login no mesmo celular),
    /// passa para quem entrou agora: a outra pessoa para de receber os avisos nele.
    /// </summary>
    public bool Registrar(Usuario quem, string? token)
    {
        token = token?.Trim() ?? "";
        if (!TokenValido(token))
        {
            Mensagens.Add("Não deu para ligar os avisos neste celular.");
            return false;
        }

        var celular = celulares.Query(c => c.Token == token).FirstOrDefault();
        if (celular is null)
        {
            return celulares.Inserir(new Celular { Token = token, Usuario = quem }) is not null;
        }

        celular.Usuario = quem;
        celular.AtualizadoEm = DateTime.UtcNow;
        return celulares.Atualizar(celular) is not null;
    }

    /// <summary>Saiu do app: o celular para de receber os avisos de quem saiu.</summary>
    public void Esquecer(Usuario quem, string? token)
    {
        var celular = celulares.Query(c => c.Token == token && c.Usuario.Id == quem.Id).FirstOrDefault();
        if (celular is not null)
        {
            celulares.Deletar(celular.Id);
        }
    }

    /// <summary>
    /// Chamado novo: "Chamado novo: ABC-1D23" / "Vazamento · urgente" no celular de quem pode atender chamados
    /// na mesma empresa, menos quem abriu. Celular que o serviço de avisos diz que não vale mais é apagado.
    /// </summary>
    public async Task AvisarChamadoNovoAsync(Chamado chamado)
    {
        try
        {
            var quemAbriu = chamado.AbertoPor;
            var tokens = celulares.Query(c => c.Usuario.EmpresaId == quemAbriu.EmpresaId && c.Usuario.Id != quemAbriu.Id)
                .Select(c => new { c.Token, c.Usuario })
                .AsEnumerable()
                .Where(c => c.Usuario.Pode(Permissao.AtenderChamados))
                .Select(c => c.Token)
                .ToList();
            if (tokens.Count == 0)
            {
                return;
            }

            var tipo = NomeDoTipo.GetValueOrDefault(chamado.Tipo, chamado.Tipo.ToString());
            var urgencia = TextoDaUrgencia.GetValueOrDefault(chamado.Urgencia, chamado.Urgencia.ToString());
            var aviso = new AvisoNoCelular($"Chamado novo: {chamado.Veiculo.Placa}", $"{tipo} · {urgencia}", chamado.Id);
            var naoValem = (await enviador.EnviarAsync(tokens, aviso)).ToList();
            if (naoValem.Count == 0)
            {
                return;
            }

            foreach (var celular in celulares.Query(c => naoValem.Contains(c.Token)).ToList())
            {
                celulares.Deletar(celular.Id);
            }
        }
        catch (Exception e)
        {
            logger.LogError(e, "Não deu para avisar o chamado {ChamadoId} nos celulares", chamado.Id);
        }
    }

    // O token que o Expo dá para o celular: ExponentPushToken[...] (ou ExpoPushToken[...])
    private static bool TokenValido(string token) =>
        token.Length <= Celular.TamanhoDoToken
        && token.EndsWith(']')
        && (token.StartsWith("ExponentPushToken[", StringComparison.Ordinal)
            || token.StartsWith("ExpoPushToken[", StringComparison.Ordinal));
}
