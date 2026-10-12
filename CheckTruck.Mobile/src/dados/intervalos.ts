import type { Intervalo, Origem } from '@/servicos/intervalos'
import { formatKm } from './formato'

// De onde vem o intervalo de troca de cada item, com os mesmos nomes do web
export const ORIGENS_INTERVALO = {
  caminhao: 'do caminhão',
  empresa: 'da empresa',
  fabrica: 'de fábrica',
  padrao: 'padrão do sistema',
} as const

// Componente de cada item (enum Componente da API), com os mesmos nomes do web
export const COMPONENTES: Record<number, string> = {
  1: 'Motor',
  2: 'Câmbio',
  3: 'Diferencial 1',
  4: 'Diferencial 2',
  5: 'Filtro',
  6: 'Embreagem',
}

/** "40.000 km ou 6 meses" (vence o que chegar primeiro) ou "40.000 km, só por km". */
export function textoDoIntervalo({ intervaloKm, intervaloMeses }: Intervalo) {
  if (!intervaloMeses) return `${formatKm(intervaloKm)}, só por km`
  return `${formatKm(intervaloKm)} ou ${intervaloMeses} ${intervaloMeses === 1 ? 'mês' : 'meses'}`
}

/** Se tirar o intervalo dessa origem, o que passa a valer é o seguinte da fila (o mesmo texto do web). */
export function oQueVoltaAValer(emOrdem: Intervalo[], origem: Origem) {
  const seguinte = emOrdem.find((i) => i.origem !== origem)
  return seguinte ? `o intervalo ${ORIGENS_INTERVALO[seguinte.origem]}` : 'nada (o item deixa de ser acompanhado)'
}
