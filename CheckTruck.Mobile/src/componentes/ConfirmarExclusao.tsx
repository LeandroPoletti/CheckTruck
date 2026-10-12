import { StyleSheet, Text, View } from 'react-native'
import Botao from './Botao'
import { cores, fontes } from '@/tema'

type Props = { titulo: string; texto: string; excluindo: boolean; aoExcluir(): void; aoCancelar(): void }

// Caixa vermelha que pede confirmação antes de excluir, no lugar do botão Excluir (os textos são os do web)
export default function ConfirmarExclusao({ titulo, texto, excluindo, aoExcluir, aoCancelar }: Props) {
  return (
    <View style={estilos.caixa}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{texto}</Text>
      <Botao titulo="Excluir" tipo="perigo" icone="trash-2" onPress={aoExcluir} ocupado={excluindo} />
      <Botao titulo="Cancelar" tipo="discreto" onPress={aoCancelar} />
    </View>
  )
}

const estilos = StyleSheet.create({
  caixa: { backgroundColor: cores.erroFundo, borderRadius: 16, padding: 16, gap: 12 },
  titulo: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.erroTexto },
  texto: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.texto },
})
