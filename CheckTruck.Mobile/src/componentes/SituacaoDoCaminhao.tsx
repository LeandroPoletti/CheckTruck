import { StyleSheet, Text } from 'react-native'
import type { Caminhao } from '@/servicos/caminhoes'
import CartaoDoCaminhao from './CartaoDoCaminhao'
import ListaDeTrocas from './ListaDeTrocas'
import ResumoDoStatus from './ResumoDoStatus'
import { cores, fontes } from '@/tema'

type Props = {
  caminhao: Caminhao
  podeAtualizarKm: boolean
  /** Mostra quem está com o caminhão (para quem cuida da frota; o motorista já sabe que é ele). */
  mostrarMotorista: boolean
  /** Quem leva o caminhão na oficina (o motorista) recebe "Fale com a oficina". */
  falarComOficina: boolean
  podeLancarOS?: boolean
  /** Com isso aparece Corrigir km (só Admin e Gestor): o km da maior OS do caminhão. */
  kmMinimoParaCorrigir?: number
}

// Situação completa de um caminhão: o cartão com o km, o resumo das trocas e a lista das próximas trocas
export default function SituacaoDoCaminhao(
  { caminhao, podeAtualizarKm, mostrarMotorista, falarComOficina, podeLancarOS, kmMinimoParaCorrigir }: Props,
) {
  return (
    <>
      <CartaoDoCaminhao
        caminhao={caminhao}
        podeAtualizarKm={podeAtualizarKm}
        mostrarMotorista={mostrarMotorista}
        podeLancarOS={podeLancarOS}
        kmMinimoParaCorrigir={kmMinimoParaCorrigir}
      />
      <ResumoDoStatus itens={caminhao.itens} falarComOficina={falarComOficina} />

      <Text style={estilos.secao}>Próximas trocas</Text>
      <ListaDeTrocas itens={caminhao.itens} />
    </>
  )
}

const estilos = StyleSheet.create({
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto, marginTop: 6 },
})
