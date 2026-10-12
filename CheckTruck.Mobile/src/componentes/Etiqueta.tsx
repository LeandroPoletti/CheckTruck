import { StyleSheet, Text } from 'react-native'
import { fontes } from '@/tema'

// Etiqueta pequena e arredondada com a cor que vier (ex.: De fábrica, Inativo, Do sistema)
export default function Etiqueta({ texto, cor }: { texto: string; cor: { texto: string; fundo: string } }) {
  return <Text style={[estilos.etiqueta, { color: cor.texto, backgroundColor: cor.fundo }]}>{texto}</Text>
}

const estilos = StyleSheet.create({
  etiqueta: { fontFamily: fontes.textoForte, fontSize: 11, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
})
