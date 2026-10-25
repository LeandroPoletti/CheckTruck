// Cores do app: as mesmas do site (o verde das placas de estrada e os cinzas "stone" do Tailwind)
export const cores = {
  marca900: '#073823',
  marca800: '#0a4a2e',
  marca700: '#0f6b42',
  marca500: '#339966',
  marca300: '#94cdb0',
  marca200: '#c0e1cf',
  marca100: '#e0f1e7',
  marca50: '#f0f9f3',
  /** Amarelo da faixa do meio da estrada (a faixa do topo das telas e a dos desenhos) */
  faixa: '#f2c230',
  texto: '#1c1917',
  textoMedio: '#57534e',
  textoFraco: '#78716c',
  borda: '#e7e5e4',
  fundo: '#edf2ee',
  branco: '#ffffff',
  erroTexto: '#b91c1c',
  erroEscuro: '#991b1b',
  erroFundo: '#fef2f2',
}

// Status de cada troca, com as mesmas cores do web: OK (verde), Atenção (âmbar), Crítico (vermelho)
export const coresDoStatus = {
  ok: { nome: 'OK', texto: cores.marca700, fundo: cores.marca50, barra: cores.marca500 },
  atencao: { nome: 'Atenção', texto: '#b45309', fundo: '#fffbeb', barra: '#f59e0b' },
  critico: { nome: 'Crítico', texto: '#b91c1c', fundo: '#fef2f2', barra: '#ef4444' },
}

// Iguais às do site: Overpass (desenhada a partir da letra das placas de estrada) nos títulos e números grandes,
// Inter no resto e Barlow Semi Condensed nas letras da placa do caminhão
export const fontes = {
  titulo: 'Overpass_800ExtraBold',
  subtitulo: 'Overpass_700Bold',
  placa: 'BarlowSemiCondensed_700Bold',
  texto: 'Inter_400Regular',
  textoMedio: 'Inter_500Medium',
  textoForte: 'Inter_600SemiBold',
}
