// Cores do app: as mesmas do site. Cada pessoa escolhe o tema dela (Verde, Azul, Amarelo ou Preto), que fica na
// conta e vale no site e no app; o padrão é o verde das placas de estrada. Os cinzas são os "stone" do Tailwind.

export type TemaDeCor = 'Verde' | 'Azul' | 'Amarelo' | 'Preto'

/** O que muda de um tema para outro */
type Paleta = {
  marca900: string
  marca800: string
  marca700: string
  marca500: string
  marca300: string
  marca200: string
  marca100: string
  marca50: string
  fundo: string
  /** O topo colorido das telas (e o fundo do login): a cor, o botão em cima dele e a letra (a principal e a fraca) */
  topo: string
  topoForte: string
  sobreTopo: string
  sobreTopo2: string
  /** A faixa tracejada do topo, embaixo do título */
  faixa: string
  /** A placa da logo e a borda dela */
  logo: string
  logoMoldura: string
  /** O caminhão do login, em cima do topo: o teto e os detalhes da cabine, e o vidro */
  tetoDoCaminhao: string
  vidroDoCaminhao: string
  /** O asfalto da estrada do login, mais escuro que o topo */
  asfalto: string
}

const TEMAS: Record<TemaDeCor, Paleta> = {
  Verde: {
    marca900: '#073823', marca800: '#0a4a2e', marca700: '#0f6b42', marca500: '#339966',
    marca300: '#94cdb0', marca200: '#c0e1cf', marca100: '#e0f1e7', marca50: '#f0f9f3', fundo: '#edf2ee',
    topo: '#073823', topoForte: '#0a4a2e', sobreTopo: '#ffffff', sobreTopo2: '#c0e1cf', faixa: '#f2c230',
    logo: '#0f6b42', logoMoldura: '#ffffff',
    tetoDoCaminhao: '#cfe0d6', vidroDoCaminhao: '#7fb59a', asfalto: '#0b2e1e',
  },
  // Azul da placa Mercosul
  Azul: {
    marca900: '#0f1d4d', marca800: '#162a6b', marca700: '#1f3a93', marca500: '#3d63c9',
    marca300: '#a3b8ea', marca200: '#c9d5f3', marca100: '#e4eaf9', marca50: '#f2f5fc', fundo: '#edf0f6',
    topo: '#0f1d4d', topoForte: '#162a6b', sobreTopo: '#ffffff', sobreTopo2: '#c9d5f3', faixa: '#f2c230',
    logo: '#1f3a93', logoMoldura: '#ffffff',
    tetoDoCaminhao: '#c9d5f3', vidroDoCaminhao: '#a3b8ea', asfalto: '#070d23',
  },
  // Amarelo das placas de advertência: o topo amarelo com a letra escura, e os botões em grafite
  Amarelo: {
    marca900: '#111214', marca800: '#1a1c1f', marca700: '#26292e', marca500: '#8a6500',
    marca300: '#ffd65a', marca200: '#ffe48f', marca100: '#fff3c7', marca50: '#fffbea', fundo: '#f3f2ee',
    topo: '#ffc72c', topoForte: '#f0b400', sobreTopo: '#1e2126', sobreTopo2: '#4a3d10', faixa: '#1e2126',
    logo: '#ffc72c', logoMoldura: '#1e2126',
    tetoDoCaminhao: '#4a3d10', vidroDoCaminhao: '#ffd65a', asfalto: '#4d3c0d',
  },
  // Preto: o topo, os botões e a logo em preto; o fundo das telas continua claro
  Preto: {
    marca900: '#141518', marca800: '#1f2125', marca700: '#2b2e33', marca500: '#5b6069',
    marca300: '#b2b6bc', marca200: '#d4d6da', marca100: '#e9eaec', marca50: '#f5f5f6', fundo: '#eef0f2',
    topo: '#141518', topoForte: '#24272b', sobreTopo: '#ffffff', sobreTopo2: '#d4d6da', faixa: '#f2c230',
    logo: '#2b2e33', logoMoldura: '#ffffff',
    tetoDoCaminhao: '#d4d6da', vidroDoCaminhao: '#b2b6bc', asfalto: '#090a0b',
  },
}

/** Amarelo da faixa do meio da estrada nos desenhos (o mesmo em todos os temas) */
export const amareloDaEstrada = '#f2c230'

/** As cores de agora: mudam quando a pessoa troca o tema (aplicarTema). Leia sempre na hora de desenhar a tela. */
export const cores = {
  ...TEMAS.Verde,
  texto: '#1c1917',
  textoMedio: '#57534e',
  textoFraco: '#78716c',
  borda: '#e7e5e4',
  branco: '#ffffff',
  erroTexto: '#b91c1c',
  erroEscuro: '#991b1b',
  erroFundo: '#fef2f2',
}

let temaAtual: TemaDeCor = 'Verde'

/** Troca as cores do app para o tema (um nome que não existe vira o Verde). Quem chama redesenha as telas. */
export function aplicarTema(tema: string | null | undefined): TemaDeCor {
  temaAtual = tema && tema in TEMAS ? (tema as TemaDeCor) : 'Verde'
  Object.assign(cores, TEMAS[temaAtual])
  return temaAtual
}

/**
 * Os estilos de cada tela dependem do tema: em vez de StyleSheet.create direto, cada arquivo usa
 * comTema(() => StyleSheet.create({...})). A função roda de novo (uma vez por tema) quando o tema muda, e
 * estilos.algumaCoisa já vem com as cores do tema de agora.
 */
export function comTema<T extends object>(criar: () => T): T {
  const porTema: Partial<Record<TemaDeCor, T>> = {}
  return new Proxy({} as T, {
    get: (_, chave) => (porTema[temaAtual] ??= criar())[chave as keyof T],
  })
}

// Status de cada troca, com as mesmas cores do site: OK (verde), Atenção (âmbar) e Crítico (vermelho), em qualquer
// tema, para ninguém confundir
export const coresDoStatus = {
  ok: { nome: 'OK', texto: '#0f6b42', fundo: '#f0f9f3', barra: '#339966' },
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
