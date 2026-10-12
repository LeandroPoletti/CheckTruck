import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import Placa from './Placa'
import { cores, fontes } from '@/tema'

// Título das janelas que sobem por cima (Atualizar km, Abrir chamado...), com a placa (quando já tem) e o X para fechar
export default function CabecalhoDoModal({ titulo, placa }: { titulo: string; placa?: string }) {
  return (
    <View style={estilos.cabecalho}>
      <View style={estilos.textos}>
        <Text style={estilos.titulo}>{titulo}</Text>
        {!!placa && <Placa placa={placa} pequena />}
      </View>
      <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
        <Feather name="x" size={24} color={cores.textoMedio} />
      </Pressable>
    </View>
  )
}

const estilos = StyleSheet.create({
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  textos: { gap: 12 },
  titulo: { fontFamily: fontes.titulo, fontSize: 30, color: cores.texto },
})
