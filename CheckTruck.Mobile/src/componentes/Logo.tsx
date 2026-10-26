import { StyleSheet, Text, View } from 'react-native'
import Svg, { G, Path, Rect } from 'react-native-svg'
import { amareloDaEstrada, comTema, cores, fontes } from '@/tema'

// Logo do CheckTruck, igual à do site: uma placa de estrada (na cor do tema) com o "visto" desenhado como uma
// estrada (asfalto, beira branca e a faixa amarela no meio)
export function Simbolo({ tamanho = 32 }: { tamanho?: number }) {
  const visto = 'M24 52 42 70 77 30'
  return (
    <Svg viewBox="0 0 100 100" width={tamanho} height={tamanho} accessible={false}>
      <Rect x="2" y="2" width="96" height="96" rx="20" fill={cores.logo} />
      <Rect x="8" y="8" width="84" height="84" rx="15" fill="none" stroke={cores.logoMoldura} strokeWidth="3.5" />
      <G fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path d={visto} stroke={cores.branco} strokeWidth="21" />
        <Path d={visto} stroke="#26302b" strokeWidth="14" />
        <Path d={visto} stroke={amareloDaEstrada} strokeWidth="3" strokeDasharray="6 6" />
      </G>
    </Svg>
  )
}

// O símbolo com o nome do lado, na cor da letra do topo (vai no topo da tela inicial)
export default function Logo({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <View style={estilos.logo} accessibilityRole="header" accessibilityLabel="CheckTruck">
      <Simbolo tamanho={tamanho} />
      <Text style={[estilos.nome, { fontSize: tamanho * 0.62 }]}>CheckTruck</Text>
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nome: { fontFamily: fontes.titulo, color: cores.sobreTopo },
}))
