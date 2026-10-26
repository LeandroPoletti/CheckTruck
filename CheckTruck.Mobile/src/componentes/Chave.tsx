import { StyleSheet, Switch, Text, View } from 'react-native'
import { comTema, cores, fontes } from '@/tema'

type Props = { titulo: string; dica?: string; valor: boolean; aoMudar(valor: boolean): void }

// Liga e desliga numa faixa cinza, com o nome e uma explicação (ex.: Ativo, no cadastro do caminhão)
export default function Chave({ titulo, dica, valor, aoMudar }: Props) {
  return (
    <View style={estilos.faixa}>
      <View style={estilos.textos}>
        <Text style={estilos.titulo}>{titulo}</Text>
        {!!dica && <Text style={estilos.dica}>{dica}</Text>}
      </View>
      <Switch
        value={valor}
        onValueChange={aoMudar}
        trackColor={{ true: cores.marca500, false: cores.borda }}
        thumbColor={cores.branco}
        accessibilityLabel={titulo}
      />
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  faixa: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: cores.fundo, borderRadius: 16, padding: 14 },
  textos: { flex: 1, gap: 2 },
  titulo: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  dica: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.textoFraco },
}))
