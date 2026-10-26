import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { comTema, cores } from '@/tema'

// Tela verde com o indicador de carregando, enquanto o app confere a sessão guardada
export default function Carregando() {
  return (
    <View style={estilos.tela}>
      <ActivityIndicator size="large" color={cores.sobreTopo} />
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  tela: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.topo },
}))
