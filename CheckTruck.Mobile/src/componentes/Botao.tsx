import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { comTema, cores, fontes } from '@/tema'

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

// A borda grossa embaixo faz o botão parecer uma tecla (igual ao site); ao apertar, ele "afunda" um pouco
const estilos = comTema(() => StyleSheet.create({
  botao: { minHeight: 52, borderRadius: 14, borderBottomWidth: 4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  principal: { backgroundColor: cores.marca700, borderBottomColor: cores.marca900 },
  principalApertado: { backgroundColor: cores.marca800, transform: [{ translateY: 2 }] },
  discreto: { borderWidth: 1.5, borderBottomWidth: 4, borderColor: cores.borda, borderBottomColor: '#d6d3d1', backgroundColor: cores.branco },
  discretoApertado: { backgroundColor: cores.fundo, transform: [{ translateY: 2 }] },
  perigo: { backgroundColor: cores.erroTexto, borderBottomColor: '#7f1d1d' },
  perigoApertado: { backgroundColor: cores.erroEscuro, transform: [{ translateY: 2 }] },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { fontFamily: fontes.textoForte, fontSize: 16 },
}))
