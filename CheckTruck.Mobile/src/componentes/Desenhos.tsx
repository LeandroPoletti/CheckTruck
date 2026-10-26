import Svg, { Circle, G, Path, Rect } from 'react-native-svg'
import { amareloDaEstrada, cores } from '@/tema'

// Desenhos do app, iguais aos do site e na cor do tema: o caminhão (no login, no topo colorido) e a estrada vazia
// (telas sem nada)

const CHASSI = '#24302b'
const METAL = '#9fb2a8'

function Roda({ x }: { x: number }) {
  return (
    <G>
      <Circle cx={x} cy="130" r="22" fill="#1c2420" />
      <Circle cx={x} cy="130" r="12" fill="#c8d3cd" />
      <Circle cx={x} cy="130" r="4" fill="#1c2420" />
    </G>
  )
}

// Cavalo mecânico "cara chata" de lado, com a cabine na cor da letra do topo (branca, ou grafite no amarelo).
// Acaba embaixo das rodas: a estrada, de ponta a ponta da tela, quem usa desenha
export function Caminhao({ largura = 260 }: { largura?: number }) {
  return (
    <Svg viewBox="0 0 340 152" width={largura} height={(largura * 152) / 340} accessible={false}>
      <Rect x="30" y="112" width="290" height="12" rx="3" fill={CHASSI} />
      <Rect x="222" y="102" width="56" height="10" rx="3" fill={CHASSI} />
      <Rect x="140" y="24" width="8" height="90" rx="4" fill={METAL} />
      <Rect x="138" y="20" width="12" height="8" rx="2" fill={CHASSI} />
      <Path d="M24 118 V52 Q24 34 42 34 H130 Q134 34 134 38 V118 Z" fill={cores.sobreTopo} />
      <Path d="M46 34 L62 15 Q64 12 68 12 H128 Q132 12 132 16 V34 Z" fill={cores.tetoDoCaminhao} />
      <Rect x="32" y="44" width="52" height="30" rx="6" fill={cores.vidroDoCaminhao} />
      <Path d="M40 70 L58 48" stroke={cores.branco} strokeOpacity={0.45} strokeWidth="4" strokeLinecap="round" />
      <Path d="M98 44 V110" stroke={cores.tetoDoCaminhao} strokeWidth="2.5" strokeOpacity={0.55} />
      <Rect x="84" y="82" width="9" height="3.5" rx="1.75" fill={cores.tetoDoCaminhao} />
      <Rect x="24" y="92" width="110" height="7" fill={amareloDaEstrada} />
      <Rect x="14" y="104" width="32" height="14" rx="4" fill={CHASSI} />
      <Rect x="16" y="95" width="11" height="6" rx="2" fill="#ffe9a8" />
      <Rect x="58" y="112" width="22" height="4" rx="2" fill={METAL} />
      <Rect x="152" y="106" width="50" height="22" rx="10" fill={METAL} />
      <Path d="M160 112 H194" stroke={CHASSI} strokeOpacity={0.35} strokeWidth="2" />
      <Path d="M38 122 A26 26 0 0 1 90 122" fill="none" stroke={CHASSI} strokeWidth="6" />
      <Rect x="208" y="112" width="106" height="7" rx="3" fill={CHASSI} />
      <Roda x={64} />
      <Roda x={236} />
      <Roda x={290} />
    </Svg>
  )
}

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
