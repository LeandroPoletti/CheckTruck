import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { cores, fontes } from '@/tema'

type Props = {
  titulo: string
  onPress(): void
  /** "principal" (verde cheio) ou "discreto" (só a borda, para ações como Sair). */
  tipo?: 'principal' | 'discreto'
  icone?: keyof typeof Feather.glyphMap
  ocupado?: boolean
}

export default function Botao({ titulo, onPress, tipo = 'principal', icone, ocupado = false }: Props) {
  const principal = tipo === 'principal'
  const corDoTexto = principal ? cores.branco : cores.textoMedio
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: ocupado }}
      onPress={onPress}
      disabled={ocupado}
      style={({ pressed }) => [
        estilos.botao,
        principal ? estilos.principal : estilos.discreto,
        pressed && (principal ? estilos.principalApertado : estilos.discretoApertado),
      ]}
    >
      {ocupado ? (
        <ActivityIndicator color={corDoTexto} />
      ) : (
        <View style={estilos.conteudo}>
          {icone && <Feather name={icone} size={18} color={corDoTexto} />}
          <Text style={[estilos.texto, { color: corDoTexto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  botao: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  principal: { backgroundColor: cores.marca700 },
  principalApertado: { backgroundColor: cores.marca800 },
  discreto: { borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.branco },
  discretoApertado: { backgroundColor: cores.fundo },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { fontFamily: fontes.textoForte, fontSize: 16 },
})
