using CheckTruck.Dominio.Interfaces;

namespace CheckTruck.Api.Avisos;

/// <summary>
/// Manda os avisos pelo serviço de push do Expo (o app é feito com Expo), que entrega no iPhone e no Android.
/// Não precisa de chave: o token já diz de qual app e de qual celular é. Vai em pedidos de até 100 avisos.
/// </summary>
public class AvisosPeloExpo(HttpClient http, ILogger<AvisosPeloExpo> logger) : IEnviadorDeAvisos
{
    private const string Endereco = "https://exp.host/--/api/v2/push/send";
    private const int PorPedido = 100;

    public async Task<IReadOnlyList<string>> EnviarAsync(IReadOnlyList<string> tokens, AvisoNoCelular aviso)
    {
        var naoValem = new List<string>();
        foreach (var parte in tokens.Chunk(PorPedido))
        {
            var mensagens = parte.Select(token => new Mensagem(token, aviso.Titulo, aviso.Texto, new Dados(aviso.ChamadoId)));
            using var resposta = await http.PostAsJsonAsync(Endereco, mensagens);
            if (!resposta.IsSuccessStatusCode)
            {
                logger.LogWarning("O serviço de avisos do Expo respondeu {Status}: {Resposta}",
                    (int)resposta.StatusCode, await resposta.Content.ReadAsStringAsync());
                continue;
            }

            // Cada resultado é do token na mesma posição
            var resultados = (await resposta.Content.ReadFromJsonAsync<Resposta>())?.Data ?? [];
            foreach (var (token, resultado) in parte.Zip(resultados))
            {
                if (resultado.Status != "error")
                {
                    continue;
                }

                logger.LogWarning("Aviso não entregue no celular: {Mensagem}", resultado.Message);
                if (resultado.Details?.Error == "DeviceNotRegistered")
                {
                    naoValem.Add(token);
                }
            }
        }

        return naoValem;
    }

    // Como o Expo pede (os nomes saem em camelCase). Canal "default": o que o app cria no Android
    private sealed record Mensagem(
        string To, string Title, string Body, Dados Data,
        string Sound = "default", string Priority = "high", string ChannelId = "default");

    // Vai junto com o aviso: o app abre os chamados quando a pessoa toca nele
    private sealed record Dados(long ChamadoId);

    private sealed record Resposta(List<Resultado>? Data);

    private sealed record Resultado(string? Status, string? Message, Detalhes? Details);

    private sealed record Detalhes(string? Error);
}
