import { StyleSheet, View } from 'react-native'
import { cores } from '@/tema'

// A faixa tracejada do meio da estrada, sumindo ao longe: a marca visual do app
export default function FaixaDaEstrada() {
  return (
    <View style={estilos.faixa} accessible={false}>
      {[1, 0.75, 0.5, 0.3, 0.15].map((opacidade) => (
        <View key={opacidade} style={[estilos.traco, { opacity: opacidade }]} />
      ))}
    </View>
  )
}

const estilos = StyleSheet.create({
  faixa: { flexDirection: 'row', gap: 8 },
  traco: { width: 22, height: 4, borderRadius: 2, backgroundColor: cores.marca500 },
})
