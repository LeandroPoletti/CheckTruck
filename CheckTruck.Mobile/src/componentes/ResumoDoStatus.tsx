import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { ItemDeTroca } from '@/servicos/caminhoes'
import { coresDoStatus, fontes } from '@/tema'

// Faixa com o resumo do caminhão: quantas trocas venceram ou estão chegando.
// Quem leva o caminhão na oficina (o motorista) é orientado a falar com ela; quem cuida da frota, a programar a troca.
export default function ResumoDoStatus({ itens, falarComOficina }: { itens: ItemDeTroca[]; falarComOficina: boolean }) {
  const vencidas = itens.filter((i) => i.status === 'critico').length
  const chegando = itens.filter((i) => i.status === 'atencao').length
  const status = vencidas > 0 ? 'critico' : chegando > 0 ? 'atencao' : 'ok'
  const cor = coresDoStatus[status]
  const [icone, titulo, texto] =
    vencidas > 0
      ? ([
          'alert-octagon',
          `${vencidas} ${vencidas === 1 ? 'troca vencida' : 'trocas vencidas'}`,
          falarComOficina ? 'Fale com a oficina para fazer a troca.' : 'Faça a troca o quanto antes.',
        ] as const)
      : chegando > 0
        ? ([
            'alert-triangle',
            `${chegando} ${chegando === 1 ? 'troca chegando' : 'trocas chegando'}`,
            falarComOficina ? 'Já dá para combinar com a oficina.' : 'Já dá para programar a troca.',
          ] as const)
        : (['check-circle', 'Tudo em dia', 'Nenhuma troca perto de vencer.'] as const)

  return (
    <View style={[estilos.resumo, { backgroundColor: cor.fundo }]}>
      <Feather name={icone} size={22} color={cor.texto} />
      <View style={estilos.textos}>
        <Text style={[estilos.titulo, { color: cor.texto }]}>{titulo}</Text>
        <Text style={[estilos.texto, { color: cor.texto }]}>{texto}</Text>
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  resumo: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16 },
  textos: { flex: 1, gap: 2 },
  titulo: { fontFamily: fontes.textoForte, fontSize: 15 },
  texto: { fontFamily: fontes.texto, fontSize: 13 },
})
