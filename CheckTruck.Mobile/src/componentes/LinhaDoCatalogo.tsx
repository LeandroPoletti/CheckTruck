import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { DaEmpresa } from './Etiqueta'
import LinhaTocavel from './LinhaTocavel'
import { comTema, cores, fontes } from '@/tema'

type Props = { primeira: boolean; nome: string; daEmpresa: boolean; detalhe: string; onPress(): void }

// Um fabricante ou um modelo no Catálogo: o nome, a conta embaixo (ex.: "Suécia · 3 modelos") e a seta para entrar
export default function LinhaDoCatalogo({ primeira, nome, daEmpresa, detalhe, onPress }: Props) {
  return (
    <LinhaTocavel primeira={primeira} rotulo={nome} onPress={onPress}>
      <View style={estilos.linha}>
        <View style={estilos.textos}>
          <View style={estilos.topo}>
            <Text style={estilos.nome}>{nome}</Text>
            {daEmpresa && <DaEmpresa />}
          </View>
          <Text style={estilos.detalhe}>{detalhe}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={cores.textoFraco} />
      </View>
    </LinhaTocavel>
  )
}

const estilos = comTema(() => StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textos: { flex: 1, gap: 4 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  nome: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  detalhe: { fontFamily: fontes.texto, fontSize: 13, color: cores.textoMedio },
}))
