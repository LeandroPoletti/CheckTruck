import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { cores } from '@/tema'

type Props = {
  /** A primeira da lista não tem a linha de cima. */
  primeira: boolean
  /** O que o leitor de tela fala (ex.: "Óleo do câmbio: Editar"). */
  rotulo: string
  /** Sem ele, a linha só mostra (ex.: tipo de manutenção do sistema, que a empresa não muda). */
  onPress?: () => void
  children: ReactNode
}

// Linha de uma lista branca que abre algo ao tocar; fica mais clara enquanto o dedo está em cima
export default function LinhaTocavel({ primeira, rotulo, onPress, children }: Props) {
  if (!onPress) return <View style={[estilos.linha, !primeira && estilos.comBorda]}>{children}</View>
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [estilos.linha, !primeira && estilos.comBorda, pressed && estilos.apertada]}
    >
      {children}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  linha: { paddingVertical: 14, gap: 4 },
  comBorda: { borderTopWidth: 1, borderTopColor: cores.borda },
  apertada: { opacity: 0.6 },
})
