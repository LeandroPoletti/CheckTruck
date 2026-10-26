import { StyleSheet, Text, View } from 'react-native'
import { EstradaVazia } from './Desenhos'
import { comTema, cores, fontes } from '@/tema'

// Cartão das listas que ainda não têm nada (ex.: nenhum caminhão, nenhuma OS): o desenho da estrada vazia,
// o que falta e o que fazer
export default function CartaoVazio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <View style={estilos.cartao}>
      <EstradaVazia />
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 8, alignItems: 'center' },
  titulo: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto, textAlign: 'center', marginTop: 6 },
  texto: { fontFamily: fontes.texto, fontSize: 15, lineHeight: 21, color: cores.textoFraco, textAlign: 'center' },
}))
