// Para cada tipo de manutenção: o intervalo que vale e de onde ele vem.
// Prioridade (a mesma da API): do caminhão → do modelo → padrão do sistema. Sem nenhum, o item não é acompanhado.
// Cada lista tem os intervalos do caminhão / modelo escolhido ({ tipoId, intervaloKm, intervaloMeses, ... }).
export function montarLinhas(tipos, { doCaminhao = [], doModelo = [], padrao = [] }) {
  const doTipo = (lista, tipo) => lista.find((i) => i.tipoId === tipo.id) ?? null
  return tipos.map((tipo) => {
    const caminhao = doTipo(doCaminhao, tipo)
    const modelo = doTipo(doModelo, tipo)
    const doSistema = doTipo(padrao, tipo)
    const origem = caminhao ? 'caminhao' : modelo ? 'modelo' : doSistema ? 'padrao' : 'nenhum'
    return { tipo, caminhao, modelo, padrao: doSistema, origem, vale: caminhao ?? modelo ?? doSistema }
  })
}

export const textoPrazo = (meses) => (meses ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : 'só por km')
