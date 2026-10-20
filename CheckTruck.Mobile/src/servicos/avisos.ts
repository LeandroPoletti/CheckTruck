import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { HORA_DO_AVISO, caminhaoDoAviso, planejarAvisos, type Aviso, type CaminhaoDoAviso } from '@/dados/avisos'
import { chamarApi, ErroDaApi } from './api'
import type { Tokens } from './armazenamento'
import { caminhoesDaFrota, meusCaminhoes } from './caminhoes'
import type { Chamar, Usuario } from './sessao'

// Os avisos de troca no celular (notificações locais: o próprio aparelho agenda, sem servidor) e o de chamado novo
// (push: vem do servidor, mesmo com o app fechado). No navegador não tem.

export const temAvisos = Platform.OS !== 'web'

/** ligados; desligados (a pessoa negou: só nas configurações do celular); perguntar (ainda não pediu). */
export type SituacaoDosAvisos = 'ligados' | 'desligados' | 'perguntar' | 'sem-suporte'

const TITULO = 'CheckTruck'

// Mostra o aviso também com o app aberto (por padrão o celular só mostra com o app fechado)
export function prepararAvisos() {
  if (!temAvisos) return
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  })
}

export async function situacaoDosAvisos(): Promise<SituacaoDosAvisos> {
  if (!temAvisos) return 'sem-suporte'
  const { status, canAskAgain } = await Notifications.getPermissionsAsync()
  if (status === 'granted') return 'ligados'
  return canAskAgain ? 'perguntar' : 'desligados'
}

export async function pedirPermissao() {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// Pede a permissão uma vez por vez que o app abre (no Android, fechar a pergunta não conta como "não")
let jaPerguntou = false

/** Troca os avisos agendados por estes. Pede a permissão se ainda não pediu; desligados, não agenda nada. */
export async function agendarAvisos(avisos: Aviso[]) {
  if (!temAvisos) return
  let situacao = await situacaoDosAvisos()
  if (situacao === 'perguntar' && !jaPerguntou) {
    jaPerguntou = true
    situacao = (await pedirPermissao()) ? 'ligados' : 'desligados'
  }
  if (situacao !== 'ligados') return

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', { name: 'Avisos de troca', importance: Notifications.AndroidImportance.HIGH })
  }
  await Notifications.cancelAllScheduledNotificationsAsync()
  for (const aviso of avisos) {
    await Notifications.scheduleNotificationAsync({
      content: { title: TITULO, body: aviso.texto },
      trigger: aviso.diario
        ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: HORA_DO_AVISO, minute: 0 }
        : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: aviso.quando },
    })
  }
}

// Endereço deste celular no serviço de avisos do Expo, já mandado para a API nesta abertura do app
let celularGravado: string | null = null

/**
 * Manda para a API o endereço deste celular (com os avisos ligados), uma vez por abertura do app: o celular fica
 * com quem entrou nele por último, e a API avisa de chamado novo quem pode atender. No Expo Go do Android dá erro
 * (lá o push não funciona): fica só sem esse aviso.
 */
async function gravarCelular(chamar: Chamar) {
  if (celularGravado || (await situacaoDosAvisos()) !== 'ligados') return
  const { data: celular } = await Notifications.getExpoPushTokenAsync()
  await chamar('/api/Celular', { metodo: 'PUT', corpo: { token: celular } })
  celularGravado = celular
}

// Apaga o celular na API com os tokens de quem saiu. Token vencido: renova só para isso (sem guardar, a pessoa saiu)
async function apagarCelular(celular: string, { accessToken, refreshToken }: Tokens) {
  const apagar = (token: string) => chamarApi('/api/Celular', { metodo: 'DELETE', corpo: { token: celular }, token })
  try {
    await apagar(accessToken)
  } catch (erro) {
    if (!(erro instanceof ErroDaApi && erro.status === 401) || !refreshToken) throw erro
    const novos = await chamarApi<Tokens>('/api/Auth/renovar', { metodo: 'POST', corpo: { refreshToken } })
    await apagar(novos.accessToken)
  }
}

/**
 * Ao sair: os avisos eram de quem estava logado. Apaga os de troca agendados e o celular para de receber os de
 * chamado. A API é chamada direto (o chamar da sessão sairia de novo no 401) e sem esperar, para o Sair não travar
 * sem internet. Sem internet ou sem renovação, ela não apaga, e o celular continua recebendo até alguém entrar nele.
 */
export async function cancelarAvisos(tokens: Tokens | null) {
  if (!temAvisos) return
  const celular = celularGravado
  celularGravado = null
  if (celular && tokens) apagarCelular(celular, tokens).catch(() => {})
  await Notifications.cancelAllScheduledNotificationsAsync()
}

/**
 * Chama aoTocar quando a pessoa toca num aviso de chamado novo, inclusive no que abriu o app (que fica guardado até
 * alguém tratar). Devolve o que desliga.
 */
export function quandoTocarNoAvisoDeChamado(aoTocar: () => void) {
  if (!temAvisos) return () => {}
  const tocou = (resposta: Notifications.NotificationResponse | null) => {
    if (!resposta?.notification.request.content.data?.chamadoId) return
    Notifications.clearLastNotificationResponse()
    aoTocar()
  }
  Notifications.getLastNotificationResponseAsync().then(tocou)
  const inscricao = Notifications.addNotificationResponseReceivedListener(tocou)
  return () => inscricao.remove()
}

export const avisoDeTeste = () =>
  Notifications.scheduleNotificationAsync({
    content: { title: TITULO, body: 'Aviso de teste: os avisos de troca estão funcionando.' },
    trigger: null,
  })

/**
 * Os caminhões de quem está logado, como a tela inicial carrega: o motorista, os dele; quem vê a frota, os ativos da
 * lista. Sem Ver frota (só chamados), nenhum.
 */
export async function caminhoesDosAvisos(chamar: Chamar, usuario: Usuario): Promise<CaminhaoDoAviso[]> {
  if (usuario.cargo === 'Motorista') return (await meusCaminhoes(chamar)).map(caminhaoDoAviso)
  if (!usuario.permissoes.includes('VerFrota')) return []
  return (await caminhoesDaFrota(chamar)).filter((c) => c.ativo).map(caminhaoDoAviso)
}

/**
 * Refaz os avisos de troca com os caminhões de agora e manda o celular para a API, para o aviso de chamado novo
 * (a tela inicial chama toda vez que aparece). Um não depende do outro.
 */
export async function atualizarAvisos(chamar: Chamar, usuario: Usuario) {
  if (!temAvisos) return
  try {
    await agendarAvisos(planejarAvisos(await caminhoesDosAvisos(chamar, usuario)))
  } finally {
    await gravarCelular(chamar)
  }
}
