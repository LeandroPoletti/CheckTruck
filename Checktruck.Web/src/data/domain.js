// Ajudantes das telas do CheckTruck.
// A situação de manutenção (o que vence e quando) é calculada pela API, não aqui.

// enum CheckTruck.Dominio.Enums.Componente
export const COMPONENTES = {
  1: 'Motor',
  2: 'Câmbio',
  3: 'Diferencial 1',
  4: 'Diferencial 2',
  5: 'Filtro',
  6: 'Embreagem',
}

// enum CheckTruck.Dominio.Enums.NormaEmissao (a API manda o nome)
export const NORMAS = {
  AntesDoEuro5: 'Antes do Euro 5',
  Euro5: 'Euro 5 (P7)',
  Euro6: 'Euro 6 (P8)',
}

// enum CheckTruck.Dominio.Enums.Tracao (a API manda o nome)
export const TRACOES = {
  QuatroPorDois: '4x2',
  SeisPorDois: '6x2',
  SeisPorQuatro: '6x4',
  OitoPorDois: '8x2',
  OitoPorQuatro: '8x4',
}

// "Volvo FH" — para listas e seletores ({ fabricanteNome, modeloNome } ou { fabricanteNome, nome })
export const nomeDoModelo = ({ fabricanteNome, modeloNome, nome }) => `${fabricanteNome ?? ''} ${modeloNome ?? nome}`.trim()

// "Volvo FH 540" — o caminhão pelo fabricante, modelo e potência
export const nomeDoCaminhao = (v) => `${nomeDoModelo(v)} ${v.potenciaCv}`

// Ordem das gerações nas listas: fabricante, modelo e ano
export const ordemDasGeracoes = (a, b) =>
  nomeDoModelo(a).localeCompare(nomeDoModelo(b)) || a.anoInicio - b.anoInicio || a.nome.localeCompare(b.nome)

// Gerações agrupadas por "Fabricante Modelo" (na ordem acima) — para <optgroup>
export function agruparPorModelo(geracoes) {
  const grupos = new Map()
  for (const g of [...geracoes].sort(ordemDasGeracoes)) {
    const chave = nomeDoModelo(g)
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave).push(g)
  }
  return [...grupos]
}

export function getUltimoRegistro(veiculoId, tipoId, registros) {
  const doTipo = registros
    .filter((r) => r.veiculoId === veiculoId && r.tipoId === tipoId)
    .sort((a, b) => new Date(b.dataRealizacao) - new Date(a.dataRealizacao))
  return doTipo[0] || null
}

export function getHistoricoVeiculo(veiculoId, registros) {
  return registros
    .filter((r) => r.veiculoId === veiculoId)
    .sort((a, b) => new Date(b.dataRealizacao) - new Date(a.dataRealizacao))
}

// Busca nas listas sem ligar para maiúscula, acento, hífen ou espaço (ABC-1234 acha ABC1234)
const normalizarBusca = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-\s]/g, '').toLowerCase()
export const contemBusca = (texto, busca) => normalizarBusca(texto).includes(normalizarBusca(busca))

export function formatKm(km) {
  return Math.round(km).toLocaleString('pt-BR') + ' km'
}

export function formatData(iso) {
  if (!iso) return '—'
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  return d.toLocaleDateString('pt-BR')
}

export function formatDataHora(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
