import type { CaminhaoNaLista, ItemDeTroca, Status } from '@/servicos/caminhoes'
import { quantos } from './formato'

// Avisos de troca que o próprio celular agenda, sem servidor (Etapa 6): todo dia às 8h enquanto tiver troca vencida
// ou chegando, e às 8h do dia em que vence a data de uma troca. São refeitos toda vez que o app carrega os caminhões.

export const HORA_DO_AVISO = 8

/** completo: com todos os itens (motorista, caminhão aberto); senão, só o item mais urgente (lista da frota). */
export type CaminhaoDoAviso = { placa: string; status: Status; itens: ItemDeTroca[]; completo: boolean }

export type Aviso = { id: string; quando: Date; diario: boolean; texto: string }

// O iPhone guarda até 64 avisos agendados por app
const LIMITE = 60

/** Do jeito que a API manda: com os itens (situação de um caminhão) ou só o mais urgente (lista). */
export function caminhaoDoAviso(c: CaminhaoNaLista & { itens?: ItemDeTroca[] | null }): CaminhaoDoAviso {
  if (c.itens) return { placa: c.placa, status: c.status, itens: c.itens, completo: true }
  return { placa: c.placa, status: c.status, itens: c.itemMaisUrgente ? [c.itemMaisUrgente] : [], completo: false }
}

/** O próximo horário do aviso: hoje, se ainda não passou das 8h; senão, amanhã. */
function proximoHorario(agora: Date) {
  const dia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), HORA_DO_AVISO)
  if (dia <= agora) dia.setDate(dia.getDate() + 1)
  return dia
}

const placas = (lista: string[]) => (lista.length > 3 ? `${lista.slice(0, 3).join(', ')} e mais ${lista.length - 3}` : lista.join(', '))

// "ABC-1D23: 1 troca vencida e 1 chegando" (um caminhão só, com todos os itens) ou, com mais de um,
// "2 caminhões com troca vencida: ABC-1D23, XYZ-9K88. 1 caminhão com troca chegando: DEF-4G56"
function resumo(caminhoes: CaminhaoDoAviso[]) {
  const [unico] = caminhoes
  if (caminhoes.length === 1 && unico.completo) {
    const vencidas = unico.itens.filter((i) => i.status === 'critico').length
    const chegando = unico.itens.filter((i) => i.status === 'atencao').length
    const texto = vencidas && chegando
      ? `${quantos(vencidas, 'troca vencida', 'trocas vencidas')} e ${chegando} chegando`
      : vencidas ? quantos(vencidas, 'troca vencida', 'trocas vencidas') : quantos(chegando, 'troca chegando', 'trocas chegando')
    return `${unico.placa}: ${texto}`
  }
  const comStatus = (s: Status) => caminhoes.filter((c) => c.status === s).map((c) => c.placa)
  const vencidos = comStatus('critico')
  const chegando = comStatus('atencao')
  return [
    vencidos.length && `${quantos(vencidos.length, 'caminhão', 'caminhões')} com troca vencida: ${placas(vencidos)}`,
    chegando.length && `${quantos(chegando.length, 'caminhão', 'caminhões')} com troca chegando: ${placas(chegando)}`,
  ].filter(Boolean).join('. ')
}

/** Os avisos a agendar, do mais cedo para o mais tarde. */
export function planejarAvisos(caminhoes: CaminhaoDoAviso[], agora = new Date()): Aviso[] {
  const avisos: Aviso[] = []
  if (caminhoes.some((c) => c.status !== 'ok')) {
    avisos.push({ id: 'diario', quando: proximoHorario(agora), diario: true, texto: resumo(caminhoes) })
  }
  for (const c of caminhoes) {
    for (const item of c.itens) {
      if (!item.dataProximaTroca) continue
      // A data vem sem hora, em UTC: o dia é o do calendário, e o aviso sai às 8h daqui
      const [ano, mes, dia] = item.dataProximaTroca.slice(0, 10).split('-').map(Number)
      const quando = new Date(ano, mes - 1, dia, HORA_DO_AVISO)
      if (quando <= agora) continue
      const nome = item.tipoManutencaoNome.charAt(0).toLowerCase() + item.tipoManutencaoNome.slice(1)
      avisos.push({ id: `${c.placa}-${item.tipoManutencaoId}`, quando, diario: false, texto: `${c.placa}: troca de ${nome} vence hoje` })
    }
  }
  return avisos.sort((a, b) => a.quando.getTime() - b.quando.getTime()).slice(0, LIMITE)
}
