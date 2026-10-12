// Números e datas no jeito brasileiro, iguais aos do web

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
