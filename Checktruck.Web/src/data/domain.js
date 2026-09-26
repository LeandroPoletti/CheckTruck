import { fabricantes, geracoes, modelos, tiposManutencao, intervalos, alertaMargemKm } from './mockData'

export function getModelo(modeloId) {
  return modelos.find((m) => m.id === modeloId)
}
export function getGeracao(geracaoId) {
  return geracoes.find((g) => g.id === geracaoId)
}
export function getFabricante(fabricanteId) {
  return fabricantes.find((f) => f.id === fabricanteId)
}
export function getTipoManutencao(tipoId) {
  return tiposManutencao.find((t) => t.id === tipoId)
}

export function getModeloCompleto(modeloId) {
  const modelo = getModelo(modeloId)
  if (!modelo) return null
  const geracao = getGeracao(modelo.geracaoId)
  const fabricante = geracao ? getFabricante(geracao.fabricanteId) : null
  return { modelo, geracao, fabricante }
}

export function getIntervalosDoModelo(modeloId) {
  return intervalos.filter((i) => i.modeloId === modeloId)
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

// RN-08: alerta quando km_atual >= km_proxima_troca - margem
export function statusPorKmRestante(kmRestante) {
  if (kmRestante <= 0) return 'critico'
  if (kmRestante <= alertaMargemKm) return 'atencao'
  return 'ok'
}

export function getSituacaoVeiculo(veiculo, registros) {
  const intervalosDoModelo = getIntervalosDoModelo(veiculo.modeloId)
  return intervalosDoModelo.map((intervalo) => {
    const ultimo = getUltimoRegistro(veiculo.id, intervalo.tipoId, registros)
    let kmProximaTroca
    let isPrimeira

    if (ultimo) {
      // já existe manutenção registrada — a próxima já foi calculada e salva (RN-07)
      kmProximaTroca = ultimo.kmProximaTroca
      isPrimeira = false
    } else {
      const limiarPrimeira = intervalo.intervaloKmPrimeira ?? intervalo.intervaloKm
      if (veiculo.kmAtual < limiarPrimeira) {
        // veículo ainda não atingiu o km de amaciamento — 1ª troca pendente
        kmProximaTroca = limiarPrimeira
        isPrimeira = true
      } else {
        // sem histórico no sistema, mas o veículo já rodou mais que o amaciamento:
        // assume-se ciclos regulares desde então e aponta o próximo múltiplo do intervalo padrão
        const ciclos = Math.floor((veiculo.kmAtual - limiarPrimeira) / intervalo.intervaloKm) + 1
        kmProximaTroca = limiarPrimeira + ciclos * intervalo.intervaloKm
        isPrimeira = false
      }
    }

    const kmRestante = kmProximaTroca - veiculo.kmAtual
    return {
      tipoId: intervalo.tipoId,
      tipo: getTipoManutencao(intervalo.tipoId),
      kmProximaTroca,
      kmRestante,
      isPrimeira,
      status: statusPorKmRestante(kmRestante),
      ultimoRegistro: ultimo,
      intervalo,
    }
  }).sort((a, b) => a.kmRestante - b.kmRestante)
}

export function getStatusGeralVeiculo(veiculo, registros) {
  const situacao = getSituacaoVeiculo(veiculo, registros)
  if (situacao.some((s) => s.status === 'critico')) return 'critico'
  if (situacao.some((s) => s.status === 'atencao')) return 'atencao'
  return 'ok'
}

// item mais urgente do veículo — usado nos cards e nos alertas do dashboard
export function getItemMaisUrgente(veiculo, registros) {
  const situacao = getSituacaoVeiculo(veiculo, registros)
  return situacao[0] || null
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
