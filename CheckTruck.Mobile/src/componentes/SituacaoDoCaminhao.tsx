import { StyleSheet, Text } from 'react-native'
import type { Caminhao } from '@/servicos/caminhoes'
import CartaoDoCaminhao from './CartaoDoCaminhao'
import ListaDeTrocas from './ListaDeTrocas'
import ResumoDoStatus from './ResumoDoStatus'
import { cores, fontes } from '@/tema'

type Props = {
  caminhao: Caminhao
  podeAtualizarKm: boolean
  /** Mostra quem está com o caminhão (só na Frota: o Autônomo não tem motorista). */
  mostrarMotorista: boolean
  /** Quem leva o caminhão na oficina (motorista, autônomo) recebe "Fale com a oficina". */
  falarComOficina: boolean
}

// Situação completa de um caminhão: o cartão com o km, o resumo das trocas e a lista das próximas trocas
export default function SituacaoDoCaminhao({ caminhao, podeAtualizarKm, mostrarMotorista, falarComOficina }: Props) {
  return (
    <>
      <CartaoDoCaminhao caminhao={caminhao} podeAtualizarKm={podeAtualizarKm} mostrarMotorista={mostrarMotorista} />
      <ResumoDoStatus itens={caminhao.itens} falarComOficina={falarComOficina} />

      <Text style={estilos.secao}>Próximas trocas</Text>
      <ListaDeTrocas itens={caminhao.itens} />
    </>
  )
}

const estilos = StyleSheet.create({
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto, marginTop: 6 },
})
