// Para cada tipo de manutenção: o intervalo que vale e de onde ele vem.
// Prioridade (a mesma da API): do caminhão → da geração → padrão do sistema. Sem nenhum, o item não é acompanhado.
// Cada lista tem os intervalos do caminhão / geração escolhida ({ tipoId, intervaloKm, intervaloMeses, ... }).
export function montarLinhas(tipos, { doCaminhao = [], daGeracao = [], padrao = [] }) {
  const doTipo = (lista, tipo) => lista.find((i) => i.tipoId === tipo.id) ?? null
  return tipos.map((tipo) => {
    const caminhao = doTipo(doCaminhao, tipo)
    const geracao = doTipo(daGeracao, tipo)
    const doSistema = doTipo(padrao, tipo)
    const origem = caminhao ? 'caminhao' : geracao ? 'geracao' : doSistema ? 'padrao' : 'nenhum'
    return { tipo, caminhao, geracao, padrao: doSistema, origem, vale: caminhao ?? geracao ?? doSistema }
  })
}

export const textoPrazo = (meses) => (meses ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : 'só por km')
