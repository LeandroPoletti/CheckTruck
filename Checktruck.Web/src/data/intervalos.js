// Para cada tipo de manutenção: o intervalo que vale e de onde ele vem.
// Prioridade (a mesma da API): do caminhão → da empresa → de fábrica → padrão do sistema. Sem nenhum, o item não é acompanhado.
// doCaminhao e padrao são listas ({ tipoId, intervaloKm, intervaloMeses, ... }); daGeracao traz os intervalos da geração:
// os de fábrica (doSistema) e os que a empresa cadastrou para ela.
export function montarLinhas(tipos, { doCaminhao = [], daGeracao = [], padrao = [] }) {
  const doTipo = (lista, tipo) => lista.find((i) => i.tipoId === tipo.id) ?? null
  const daEmpresa = daGeracao.filter((i) => !i.doSistema)
  const deFabrica = daGeracao.filter((i) => i.doSistema)
  return tipos.map((tipo) => {
    const caminhao = doTipo(doCaminhao, tipo)
    const empresa = doTipo(daEmpresa, tipo)
    const fabrica = doTipo(deFabrica, tipo)
    const doSistema = doTipo(padrao, tipo)
    const origem = caminhao ? 'caminhao' : empresa ? 'empresa' : fabrica ? 'fabrica' : doSistema ? 'padrao' : 'nenhum'
    return { tipo, caminhao, empresa, fabrica, padrao: doSistema, origem, vale: caminhao ?? empresa ?? fabrica ?? doSistema }
  })
}

export const textoPrazo = (meses) => (meses ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : 'só por km')
