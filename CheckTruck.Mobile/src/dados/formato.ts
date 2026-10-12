// Números e datas no jeito brasileiro, iguais aos do web, e a busca das listas

/** Busca sem ligar para maiúscula nem acento: "joao" acha "João". */
export function contemBusca(texto: string, busca: string) {
  const limpar = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return limpar(texto).includes(limpar(busca.trim()))
}

export const formatKm = (km: number) => `${Math.round(km).toLocaleString('pt-BR')} km`

const doisDigitos = (n: number) => String(n).padStart(2, '0')

/** Data que a API guarda sem hora (ex.: próxima troca): lida em UTC para não voltar um dia no Brasil. */
export function formatData(iso: string) {
  const d = new Date(iso)
  return `${doisDigitos(d.getUTCDate())}/${doisDigitos(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`
}

/** Data e hora de um registro (ex.: chamado aberto), no fuso do celular. */
export function formatDataHora(iso: string) {
  const d = new Date(iso)
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()} às ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`
}

/** Hoje no fuso do celular, em aaaa-mm-dd (o toISOString daria a data de Londres, que à noite já é amanhã). */
export function hoje() {
  const d = new Date()
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}

/** aaaa-mm-dd para dd/mm/aaaa (para mostrar num campo). */
export const dataParaCampo = (data: string) => data.split('-').reverse().join('/')

/** Põe as barras enquanto a pessoa digita a data: "1210" vira "12/10". */
export function mascaraData(texto: string) {
  const d = texto.replace(/\D/g, '').slice(0, 8)
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join('/')
}

/** dd/mm/aaaa digitado para aaaa-mm-dd. null se não for uma data que existe. */
export function dataDoCampo(texto: string) {
  const [dia, mes, ano] = texto.split('/').map(Number)
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return null
  const d = new Date(Date.UTC(ano, mes - 1, dia))
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null
  return `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`
}

export function textoKmRestante(km: number) {
  if (km > 0) return `Faltam ${formatKm(km)}`
  if (km === 0) return 'Trocar agora'
  return `Passou ${formatKm(-km)}`
}

export function textoDias(dias: number) {
  if (dias > 1) return `faltam ${dias} dias`
  if (dias === 1) return 'falta 1 dia'
  if (dias === 0) return 'vence hoje'
  return `venceu há ${-dias} dia${dias === -1 ? '' : 's'}`
}
