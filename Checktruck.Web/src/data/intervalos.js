// Linhas da tela Intervalos. A ordem em que os intervalos valem (do caminhão → da empresa → de fábrica → padrão
// do sistema) vem pronta da API; aqui só junta com a lista de tipos. O primeiro da lista é o que vale.
export function montarLinhas(tipos, tabela) {
  const porTipo = new Map(tabela.map((l) => [l.tipoId, l.emOrdem]))
  return tipos.map((tipo) => {
    const emOrdem = porTipo.get(tipo.id) ?? []
    return { tipo, emOrdem, vale: emOrdem[0] ?? null, origem: emOrdem[0]?.origem ?? 'nenhum' }
  })
}

// De onde vem o intervalo, para os textos ("o intervalo da empresa")
export const ORIGENS_INTERVALO = {
  caminhao: 'do caminhão',
  empresa: 'da empresa',
  fabrica: 'de fábrica',
  padrao: 'padrão do sistema',
}

// O intervalo de uma origem na linha (ex.: o da empresa), ou null
export const daOrigem = (linha, origem) => linha.emOrdem.find((i) => i.origem === origem) ?? null

// Se tirar o intervalo dessa origem, o que passa a valer é o seguinte da fila
export function oQueVoltaAValer(linha, origem) {
  const seguinte = linha.emOrdem.find((i) => i.origem !== origem)
  return seguinte ? `o intervalo ${ORIGENS_INTERVALO[seguinte.origem]}` : 'nada (o item deixa de ser acompanhado)'
}

export const textoPrazo = (meses) => (meses ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : 'só por km')
