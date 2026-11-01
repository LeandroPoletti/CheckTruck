import Svg, { Path, Rect } from 'react-native-svg'
import { amareloDaEstrada, cores } from '@/tema'

// Desenho do app, igual ao do site e na cor do tema: a estrada vazia (telas sem nada)

const METAL = '#9fb2a8'

// Estrada vazia indo até o horizonte, com uma placa (na cor da logo) na beira
export function EstradaVazia({ largura = 140 }: { largura?: number }) {
  return (
    <Svg viewBox="0 0 160 96" width={largura} height={(largura * 96) / 160} accessible={false}>
      <Path d="M0 40 H160 V96 H0 Z" fill={cores.marca100} />
      <Path d="M74 40 H86 L128 96 H32 Z" fill="#3a4540" />
      <Path d="M79.2 46 h1.6 l.5 6 h-2.6 Z M78.6 58 h2.8 l.9 10 h-4.6 Z M77.6 75 h4.8 l1.5 16 h-7.8 Z" fill={amareloDaEstrada} />
      <Path d="M74 40 H86" stroke={cores.marca200} strokeWidth="1.5" />
      <Rect x="130" y="40" width="3" height="34" rx="1" fill={METAL} />
      <Rect x="117" y="18" width="29" height="23" rx="4" fill={cores.logo} />
      <Rect x="119.5" y="20.5" width="24" height="18" rx="2.5" fill="none" stroke={cores.logoMoldura} strokeWidth="1.2" />
      <Path d="M124 29.5 128.5 34 138 24.5" fill="none" stroke={cores.logoMoldura} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
