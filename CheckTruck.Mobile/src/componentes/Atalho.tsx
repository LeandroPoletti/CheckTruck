import { Pressable, StyleSheet, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { cores, fontes } from '@/tema'

// Linha branca que leva para outra tela (ex.: o histórico do caminhão, os intervalos de troca)
export default function Atalho({ icone, titulo, onPress }: { icone: keyof typeof Feather.glyphMap; titulo: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [estilos.atalho, pressed && estilos.atalhoApertado]} accessibilityRole="button">
      <Feather name={icone} size={18} color={cores.marca700} />
      <Text style={estilos.atalhoTexto}>{titulo}</Text>
      <Feather name="chevron-right" size={20} color={cores.textoFraco} />
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  atalho: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: cores.branco, borderRadius: 16, padding: 16 },
  atalhoApertado: { backgroundColor: cores.marca50 },
  atalhoTexto: { flex: 1, fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
})
