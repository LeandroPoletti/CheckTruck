// Regras de negócio do CheckTruck (RN-01 a RN-08) calculadas sobre os dados da API.

// RN-08: margem de alerta antes do km da próxima troca
export const ALERTA_MARGEM_KM = 5000

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
  if (kmRestante <= ALERTA_MARGEM_KM) return 'atencao'
  return 'ok'
}

// Funções que dependem do catálogo carregado da API (fabricantes, gerações,
// modelos, tipos de manutenção e intervalos). Use via useDominio() do AppContext.
export function criarDominio({ fabricantes, geracoes, modelos, tiposManutencao, intervalos }) {
  function getModelo(modeloId) {
    return modelos.find((m) => m.id === modeloId)
  }
  function getGeracao(geracaoId) {
    return geracoes.find((g) => g.id === geracaoId)
  }
  function getFabricante(fabricanteId) {
    return fabricantes.find((f) => f.id === fabricanteId)
  }
  function getTipoManutencao(tipoId) {
    return tiposManutencao.find((t) => t.id === tipoId)
  }

  function getModeloCompleto(modeloId) {
    const modelo = getModelo(modeloId)
    if (!modelo) return null
    const geracao = getGeracao(modelo.geracaoId)
    const fabricante = geracao ? getFabricante(geracao.fabricanteId) : null
    return { modelo, geracao, fabricante }
  }

  function getIntervalosDoModelo(modeloId) {
    return intervalos.filter((i) => i.modeloId === modeloId)
  }

  function getSituacaoVeiculo(veiculo, registros) {
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

  function getStatusGeralVeiculo(veiculo, registros) {
    const situacao = getSituacaoVeiculo(veiculo, registros)
    if (situacao.some((s) => s.status === 'critico')) return 'critico'
    if (situacao.some((s) => s.status === 'atencao')) return 'atencao'
    return 'ok'
  }

  // item mais urgente do veículo — usado nos cards e nos alertas do dashboard
  function getItemMaisUrgente(veiculo, registros) {
    const situacao = getSituacaoVeiculo(veiculo, registros)
    return situacao[0] || null
  }

  return {
    getModelo,
    getGeracao,
    getFabricante,
    getTipoManutencao,
    getModeloCompleto,
    getIntervalosDoModelo,
    getSituacaoVeiculo,
    getStatusGeralVeiculo,
    getItemMaisUrgente,
  }
}

// Nome de exibição de uma pessoa. A API ainda não expõe nome/e-mail de
// motoristas e técnicos (TODO GET /api/Usuario), então cai para o CPF.
export function nomePessoa(pessoa) {
  if (!pessoa) return null
  return pessoa.nome || pessoa.email || (pessoa.cpf ? `CPF ${pessoa.cpf}` : `#${pessoa.id}`)
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
