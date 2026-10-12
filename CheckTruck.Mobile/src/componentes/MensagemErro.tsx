import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { cores, fontes } from '@/tema'

// Faixa vermelha com a mensagem de erro. Sem mensagem, não aparece.
export default function MensagemErro({ children }: { children?: string | null }) {
  if (!children) return null
  return (
    <View style={estilos.erro} accessibilityRole="alert">
      <Feather name="alert-circle" size={18} color={cores.erroTexto} />
      <Text style={estilos.texto}>{children}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  erro: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: cores.erroFundo,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  texto: { flex: 1, fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.erroTexto },
})
