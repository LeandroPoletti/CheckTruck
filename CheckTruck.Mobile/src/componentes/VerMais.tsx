import { StyleSheet, Text, View } from 'react-native'
import { MAXIMO, maisUmaVez } from '@/dados/pagina'
import Botao from './Botao'
import { comTema, cores, fontes } from '@/tema'

type Props = {
  /** Quantos foram pedidos. */
  quantos: number
  /** Quantos vieram. */
  mostrando: number
  total: number
  aoVerMais(novoQuantos: number): void
  /** No máximo da API, no lugar do botão (ex.: usar a busca ou o período). */
  dicaNoMaximo?: string
}

// Fim de uma lista que vem aos poucos (dados/pagina.ts), igual ao site: quantos aparecem e o botão Ver mais, que
// fica ocupado até os novos chegarem
export default function VerMais({ quantos, mostrando, total, aoVerMais, dicaNoMaximo }: Props) {
  if (mostrando >= total) return null
  const noMaximo = quantos >= MAXIMO
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.texto}>
        Mostrando {mostrando.toLocaleString('pt-BR')} de {total.toLocaleString('pt-BR')}.
        {noMaximo && dicaNoMaximo ? ` ${dicaNoMaximo}` : ''}
      </Text>
      {!noMaximo && (
        <Botao
          titulo="Ver mais"
          tipo="discreto"
          ocupado={mostrando < Math.min(quantos, total)}
          onPress={() => aoVerMais(maisUmaVez(quantos))}
        />
      )}
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  bloco: { gap: 10 },
  texto: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoMedio, textAlign: 'center' },
}))
