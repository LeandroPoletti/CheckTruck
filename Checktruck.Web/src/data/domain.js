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

// Limite de ano em todo o sistema (o mesmo da API, AnoUtil): o primeiro caminhão é de 1896, então nada
// antes de 1900; e nada depois do ano que vem, porque o ano-modelo pode ser o do ano seguinte.
export const ANO_MINIMO = 1900
export const ANO_MAXIMO = new Date().getFullYear() + 1
export const anoValido = (ano) => Number.isInteger(ano) && ano >= ANO_MINIMO && ano <= ANO_MAXIMO

// Hoje no fuso de quem usa (toISOString daria a data de Londres, que à noite já é amanhã)
export const hoje = () => new Date().toLocaleDateString('sv-SE')

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

// enum CheckTruck.Dominio.Enums.OrigemKm: o que mudou o km do caminhão (a API manda o nome)
export const ORIGENS_KM = {
  Cadastro: 'Cadastro',
  AtualizarKm: 'Atualizar km',
  OrdemServico: 'OS',
  Edicao: 'Editar veículo',
  Correcao: 'Correção',
}

// Placa como o sistema grava (a mesma regra da API, PlacaUtil): maiúscula e com hífen, ABC-1234 ou ABC-1D23.
// Pode digitar de qualquer jeito (abc1d23, ABC 1D23...): o campo já vai arrumando.
export function formatarPlaca(texto) {
  const limpa = String(texto ?? '').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 7)
  return limpa.length > 3 ? `${limpa.slice(0, 3)}-${limpa.slice(3)}` : limpa
}
export const placaValida = (placa) => /^[A-Z]{3}-\d[A-Z\d]\d{2}$/.test(placa)

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

// Dias até a data da próxima troca (negativo = já venceu)
export const textoDias = (dias) =>
  dias > 0 ? `${dias} dia${dias === 1 ? '' : 's'}` : dias === 0 ? 'vence hoje' : `venceu há ${-dias} dia${dias === -1 ? '' : 's'}`

export function formatData(iso) {
  if (!iso) return '—'
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  return d.toLocaleDateString('pt-BR')
}

export function formatDataHora(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
