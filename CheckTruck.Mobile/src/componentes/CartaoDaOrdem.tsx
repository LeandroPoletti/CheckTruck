import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { OrdemDeServico } from '@/servicos/ordens'
import { formatData, formatDataHora, formatKm } from '@/dados/formato'
import Placa from './Placa'
import { cores, coresDoStatus, fontes } from '@/tema'

type Props = {
  os: OrdemDeServico
  /** A placa abre o caminhão. Sem isso (ex.: no próprio caminhão), a placa não aparece. */
  mostrarPlaca?: boolean
}

// Uma ordem de serviço: número, data e km, os itens com a próxima troca, quem fez, o motorista e quem lançou
export default function CartaoDaOrdem({ os, mostrarPlaca = true }: Props) {
  const veiculo = mostrarPlaca ? os.veiculo : null
  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <View>
          <Text style={estilos.numero}>OS nº {os.id}</Text>
          <Text style={estilos.meta}>{formatData(os.realizadoEm)} · {formatKm(os.kmAtual)}</Text>
        </View>
        {veiculo && (
          <Pressable
            onPress={() => router.push({ pathname: '/caminhao/[id]', params: { id: veiculo.id } })}
            accessibilityRole="link"
          >
            <Placa placa={veiculo.placa} pequena />
          </Pressable>
        )}
      </View>

      <View style={estilos.divisoria} />
      {os.itens.map((i) => (
        <View key={i.id} style={estilos.linha}>
          <View style={estilos.itemNome}>
            <Text style={estilos.item}>{i.tipoManutencao?.nome}</Text>
            {i.isPrimeiraTroca && <Text style={estilos.selo}>1ª troca</Text>}
          </View>
          <Text style={estilos.meta}>próx. {formatKm(i.kmProximaTroca)}</Text>
        </View>
      ))}
      <View style={estilos.divisoria} />

      <Text style={estilos.detalhe}>Feita por {os.mecanicos.map((m) => `${m.nome} (${m.funcao})`).join(', ')}</Text>
      {!!os.concessionaria && <Text style={estilos.detalhe}>Concessionária / oficina: {os.concessionaria}</Text>}
      <Text style={estilos.detalhe}>Motorista: {os.motorista?.nome ?? 'Sem motorista'}</Text>
      {!!os.observacao && <Text style={estilos.detalhe}>Observações: {os.observacao}</Text>}
      <Text style={estilos.meta}>
        Lançada{os.lancadoPor ? ` por ${os.lancadoPor.nome}` : ''} em {formatDataHora(os.lancadoEm)}
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 16, gap: 8 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  numero: { fontFamily: fontes.subtitulo, fontSize: 20, color: cores.texto },
  meta: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoFraco },
  divisoria: { height: 1, backgroundColor: cores.borda },
  itemNome: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  item: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  selo: {
    fontFamily: fontes.textoForte,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
    color: coresDoStatus.atencao.texto,
    backgroundColor: coresDoStatus.atencao.fundo,
  },
  detalhe: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoMedio },
})
