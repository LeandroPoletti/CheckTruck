import { StyleSheet, View } from 'react-native'
import { comTema, cores, coresDoStatus } from '@/tema'
import type { Status } from '@/servicos/caminhoes'

// Quanto do ciclo de troca já foi rodado (barra cheia = na hora de trocar), na cor do status. Igual à do web.
export default function BarraDeUso({ percentual, status }: { percentual: number; status: Status }) {
  return (
    <View style={estilos.trilho}>
      <View style={[estilos.barra, { width: `${Math.max(2, percentual)}%`, backgroundColor: coresDoStatus[status].barra }]} />
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  trilho: { height: 6, borderRadius: 3, backgroundColor: cores.fundo, overflow: 'hidden' },
  barra: { height: '100%', borderRadius: 3 },
}))
