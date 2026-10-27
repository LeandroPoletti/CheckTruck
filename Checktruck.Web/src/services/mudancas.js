// Canal com a API (SignalR) que avisa quando alguém da empresa muda alguma coisa, pelo site ou pelo app: as telas
// abertas recarregam sozinhas (useCargaDaTela) e os dados de quem está logado são lidos de novo (ex.: o tema).
// Quem fez a mudança não recebe o aviso: o id deste canal vai em cada pedido (api.js, cabeçalho X-Conexao).
import { api, definirConexao, lerSessao } from './api'

const ouvintes = new Set()

/** Chama aoMudar a cada aviso que chegar. Devolve a função que para de ouvir. */
export function quandoMudar(aoMudar) {
  ouvintes.add(aoMudar)
  return () => { ouvintes.delete(aoMudar) }
}

const avisar = () => ouvintes.forEach((aoMudar) => aoMudar())

// Caiu (rede, API reiniciada): tenta voltar para sempre, nas primeiras vezes logo e depois a cada 10 segundos
const voltar = { nextRetryDelayInMilliseconds: ({ previousRetryCount }) => (previousRetryCount < 3 ? 2000 : 10000) }

/** Abre o canal de quem está logado. Devolve a função que fecha (ao sair do site). */
export function abrirCanal() {
  let fechado = false
  let espera
  let conexao = null

  async function ligar() {
    try {
      await conexao.start()
      definirConexao(conexao.connectionId)
    } catch {
      if (!fechado) espera = setTimeout(ligar, 10000) // a API ainda não respondeu: tenta de novo daqui a pouco
    }
  }

  // A biblioteca do SignalR vem à parte, depois da tela: não atrasa a abertura do site
  import('@microsoft/signalr').then(({ HubConnectionBuilder, LogLevel }) => {
    if (fechado) return
    conexao = new HubConnectionBuilder()
      .withUrl(`${api.defaults.baseURL}/hubs/mudancas`, {
        accessTokenFactory: () => lerSessao()?.accessToken ?? '',
        withCredentials: false, // o login vai no token, sem cookie (e a API libera qualquer origem)
      })
      .withAutomaticReconnect(voltar)
      .configureLogging(LogLevel.None)
      .build()
    conexao.on('mudou', avisar)
    conexao.onreconnecting(() => definirConexao(null))
    // Enquanto esteve fora pode ter perdido algum aviso: recarrega também
    conexao.onreconnected(() => {
      definirConexao(conexao.connectionId)
      avisar()
    })
    ligar()
  })

  return () => {
    fechado = true
    clearTimeout(espera)
    definirConexao(null)
    conexao?.stop()
  }
}
