// Ajudantes das telas do CheckTruck. As funções recebem o catálogo que cada página
// carregou da API ({ fabricantes, geracoes, modelos, tiposManutencao }).
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

function getModelo(catalogo, modeloId) {
  return catalogo.modelos.find((m) => m.id === modeloId)
}
function getGeracao(catalogo, geracaoId) {
  return catalogo.geracoes.find((g) => g.id === geracaoId)
}
function getFabricante(catalogo, fabricanteId) {
  return catalogo.fabricantes.find((f) => f.id === fabricanteId)
}
export function getTipoManutencao(catalogo, tipoId) {
  return catalogo.tiposManutencao.find((t) => t.id === tipoId)
}

export function getModeloCompleto(catalogo, modeloId) {
  const modelo = getModelo(catalogo, modeloId)
  if (!modelo) return null
  const geracao = getGeracao(catalogo, modelo.geracaoId)
  const fabricante = geracao ? getFabricante(catalogo, geracao.fabricanteId) : null
  return { modelo, geracao, fabricante }
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
