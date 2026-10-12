import { StyleSheet, Text, View } from 'react-native'
import type { ItemDeTroca } from '@/servicos/caminhoes'
import { formatData, formatKm, textoDias, textoKmRestante } from '@/dados/formato'
import BarraDeUso from './BarraDeUso'
import EtiquetaStatus from './EtiquetaStatus'
import { cores, coresDoStatus, fontes } from '@/tema'

// Próximas trocas do caminhão, da mais urgente para a menos urgente: quanto falta em km, a barra e quando trocar
export default function ListaDeTrocas({ itens }: { itens: ItemDeTroca[] }) {
  return (
    <View style={estilos.lista}>
      {itens.map((item, i) => <LinhaDaTroca key={item.tipoManutencaoId} item={item} primeira={i === 0} />)}
    </View>
  )
}

function LinhaDaTroca({ item, primeira }: { item: ItemDeTroca; primeira: boolean }) {
  const quando = [
    `Próxima troca com ${formatKm(item.kmProximaTroca)}`,
    item.dataProximaTroca && item.diasRestantes !== null
      ? ` ou em ${formatData(item.dataProximaTroca)} (${textoDias(item.diasRestantes)})`
      : '',
    item.isPrimeiraTroca ? '. É a 1ª troca.' : '',
  ].join('')

  return (
    <View style={[estilos.troca, !primeira && estilos.trocaComLinha]}>
      <View style={estilos.topo}>
        <Text style={estilos.nome}>{item.tipoManutencaoNome}</Text>
        <EtiquetaStatus status={item.status} />
      </View>
      <Text style={[estilos.km, item.status !== 'ok' && { color: coresDoStatus[item.status].texto }]}>
        {textoKmRestante(item.kmRestante)}
      </Text>
      <BarraDeUso percentual={item.percentualUsado} status={item.status} />
      <Text style={estilos.quando}>{quando}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
  troca: { paddingVertical: 16, gap: 8 },
  trocaComLinha: { borderTopWidth: 1, borderTopColor: cores.borda },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  nome: { flex: 1, fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  km: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.texto },
  quando: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoFraco },
})
