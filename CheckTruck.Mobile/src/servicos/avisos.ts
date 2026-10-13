import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { HORA_DO_AVISO, caminhaoDoAviso, planejarAvisos, type Aviso, type CaminhaoDoAviso } from '@/dados/avisos'
import { caminhoesDaFrota, meusCaminhoes, situacaoDoCaminhao } from './caminhoes'
import type { Chamar, Usuario } from './sessao'

// Os avisos de troca no celular (notificações locais: o próprio aparelho agenda, sem servidor). No navegador não tem.

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

/** Ao sair: os avisos eram de quem estava logado. */
export async function cancelarAvisos() {
  if (temAvisos) await Notifications.cancelAllScheduledNotificationsAsync()
}

export const avisoDeTeste = () =>
  Notifications.scheduleNotificationAsync({
    content: { title: TITULO, body: 'Aviso de teste: os avisos de troca estão funcionando.' },
    trigger: null,
  })

/**
 * Os caminhões de quem está logado, como a tela inicial carrega: o motorista, os dele; quem vê a frota, a lista
 * (no Autônomo com um caminhão só, com todos os itens). Sem Ver frota (só chamados), nenhum.
 */
export async function caminhoesDosAvisos(chamar: Chamar, usuario: Usuario): Promise<CaminhaoDoAviso[]> {
  if (usuario.cargo === 'Motorista') return (await meusCaminhoes(chamar)).map(caminhaoDoAviso)
  if (!usuario.permissoes.includes('VerFrota')) return []
  const ativos = (await caminhoesDaFrota(chamar)).filter((c) => c.ativo)
  const [unico] = ativos
  if (usuario.tipoConta === 'Autonomo' && ativos.length === 1) return [caminhaoDoAviso(await situacaoDoCaminhao(chamar, unico.id))]
  return ativos.map(caminhaoDoAviso)
}

/** Refaz os avisos com os caminhões de agora (a tela inicial chama toda vez que aparece). */
export async function atualizarAvisos(chamar: Chamar, usuario: Usuario) {
  if (temAvisos) await agendarAvisos(planejarAvisos(await caminhoesDosAvisos(chamar, usuario)))
}
