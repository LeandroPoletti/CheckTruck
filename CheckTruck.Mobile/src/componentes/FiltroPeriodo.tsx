import { StyleSheet, Text, View } from 'react-native'
import { PERIODOS, erroDoPeriodo, type FiltroDePeriodo } from '@/dados/periodo'
import { mascaraData } from '@/dados/formato'
import Campo from './Campo'
import Escolha from './Escolha'
import MensagemErro from './MensagemErro'
import { comTema, cores, fontes } from '@/tema'

type Props = {
  valor: FiltroDePeriodo
  aoMudar(valor: FiltroDePeriodo): void
  /** As OS que sobraram, para o "3 OS no período". */
  quantas: number
}

// Período das OS, pela data da troca, igual ao site: os atalhos em pílulas e, em "Escolher datas", De e Até
// digitados (dd/mm/aaaa)
export default function FiltroPeriodo({ valor, aoMudar, quantas }: Props) {
  const erro = erroDoPeriodo(valor)
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Período</Text>
      <Escolha opcoes={PERIODOS} escolhidos={[valor.periodo]} aoTocar={(periodo) => aoMudar({ ...valor, periodo })} />
      {valor.periodo === 'datas' && (
        <View style={estilos.datas}>
          <View style={estilos.metade}>
            <Campo
              rotulo="De"
              value={valor.de}
              onChangeText={(texto) => aoMudar({ ...valor, de: mascaraData(texto) })}
              keyboardType="number-pad"
              placeholder="dd/mm/aaaa"
              maxLength={10}
            />
          </View>
          <View style={estilos.metade}>
            <Campo
              rotulo="Até"
              value={valor.ate}
              onChangeText={(texto) => aoMudar({ ...valor, ate: mascaraData(texto) })}
              keyboardType="number-pad"
              placeholder="dd/mm/aaaa"
              maxLength={10}
            />
          </View>
        </View>
      )}
      <MensagemErro>{erro}</MensagemErro>
      {valor.periodo !== 'tudo' && !erro && quantas > 0 && <Text style={estilos.quantas}>{quantas} OS no período</Text>}
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 16, gap: 12 },
  titulo: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  datas: { flexDirection: 'row', gap: 12 },
  metade: { flex: 1 },
  quantas: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoMedio },
}))
