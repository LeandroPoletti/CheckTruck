import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { cores, fontes } from '@/tema'

type Props = {
  titulo: string
  onPress(): void
  /** "principal" (verde cheio), "discreto" (só a borda, para ações como Sair) ou "perigo" (vermelho, para excluir). */
  tipo?: 'principal' | 'discreto' | 'perigo'
  icone?: keyof typeof Feather.glyphMap
  ocupado?: boolean
}

export default function Botao({ titulo, onPress, tipo = 'principal', icone, ocupado = false }: Props) {
  const corDoTexto = tipo === 'discreto' ? cores.textoMedio : cores.branco
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: ocupado }}
      onPress={onPress}
      disabled={ocupado}
      style={({ pressed }) => [
        estilos.botao,
        estilos[tipo],
        pressed && estilos[`${tipo}Apertado`],
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
  perigo: { backgroundColor: cores.erroTexto },
  perigoApertado: { backgroundColor: cores.erroEscuro },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { fontFamily: fontes.textoForte, fontSize: 16 },
})
