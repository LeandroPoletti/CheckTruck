import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { API_URL, definirConexao } from './api'

// Canal com a API (SignalR) que avisa quando alguém da empresa muda alguma coisa, pelo site ou pelo app: as telas
// abertas recarregam sozinhas (useCarregarNaTela, na sessão). Quem fez a mudança não recebe o aviso: o id deste
// canal vai em cada pedido (api.ts, cabeçalho X-Conexao).

// Caiu (rede, app em segundo plano, API reiniciada): tenta voltar para sempre, nas primeiras vezes logo e depois a
// cada 10 segundos
const voltar = {
  nextRetryDelayInMilliseconds: ({ previousRetryCount }: { previousRetryCount: number }) =>
    (previousRetryCount < 3 ? 2000 : 10000),
}

/** Abre o canal de quem está logado e chama aoMudar a cada aviso. Devolve a função que fecha (ao sair). */
export function abrirCanal(token: () => string | null, aoMudar: () => void): () => void {
  const conexao = new HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/mudancas`, { accessTokenFactory: () => token() ?? '', withCredentials: false })
    .withAutomaticReconnect(voltar)
    .configureLogging(LogLevel.None)
    .build()

  conexao.on('mudou', aoMudar)
  conexao.onreconnecting(() => definirConexao(null))
  // Enquanto esteve fora pode ter perdido algum aviso: recarrega também
  conexao.onreconnected(() => {
    definirConexao(conexao.connectionId)
    aoMudar()
  })

  let fechado = false
  let espera: ReturnType<typeof setTimeout> | undefined
  async function ligar() {
    try {
      await conexao.start()
      definirConexao(conexao.connectionId)
    } catch {
      if (!fechado) espera = setTimeout(ligar, 10000) // a API ainda não respondeu: tenta de novo daqui a pouco
    }
  }
  ligar()

  return () => {
    fechado = true
    clearTimeout(espera)
    definirConexao(null)
    conexao.stop()
  }
}
