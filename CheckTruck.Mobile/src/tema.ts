// Cores do app: as mesmas do web (verde da marca e os cinzas "stone" do Tailwind)
export const cores = {
  marca900: '#1c3829',
  marca800: '#234433',
  marca700: '#2c5440',
  marca500: '#46825f',
  marca300: '#90b69f',
  marca200: '#b6d0c0',
  marca100: '#dbeae0',
  marca50: '#eef5f0',
  texto: '#1c1917',
  textoMedio: '#57534e',
  textoFraco: '#78716c',
  borda: '#e7e5e4',
  fundo: '#f5f5f4',
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

// Barlow Semi Condensed (desenhada a partir das placas de estrada) nos títulos; Inter (a do web) no resto
export const fontes = {
  titulo: 'BarlowSemiCondensed_700Bold',
  subtitulo: 'BarlowSemiCondensed_600SemiBold',
  texto: 'Inter_400Regular',
  textoMedio: 'Inter_500Medium',
  textoForte: 'Inter_600SemiBold',
}
