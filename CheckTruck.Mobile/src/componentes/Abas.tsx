import { Pressable, StyleSheet, Text, View } from 'react-native'
import { cores, coresDoStatus, fontes } from '@/tema'

export type DadosDaAba<T> = { id: T; titulo: string; contador?: number }

type Props<T> = { abas: DadosDaAba<T>[]; escolhida: NoInfer<T>; aoEscolher(id: NoInfer<T>): void }

// Abas de cima numa faixa branca: a escolhida fica verde. O contador (ex.: chamados pendentes) aparece quando passa de 0
export default function Abas<T extends string>({ abas, escolhida, aoEscolher }: Props<T>) {
  return (
    <View style={estilos.abas} accessibilityRole="tablist">
      {abas.map((a) => <BotaoDaAba key={a.id} {...a} escolhida={escolhida === a.id} aoEscolher={aoEscolher} />)}
    </View>
  )
}

function BotaoDaAba<T extends string>(
  { id, titulo, contador = 0, escolhida, aoEscolher }: DadosDaAba<T> & { escolhida: boolean; aoEscolher(id: T): void },
) {
  return (
    <Pressable
      onPress={() => aoEscolher(id)}
      style={[estilos.aba, escolhida && estilos.abaEscolhida]}
      accessibilityRole="tab"
      accessibilityState={{ selected: escolhida }}
    >
      <Text style={[estilos.abaTexto, escolhida && estilos.abaTextoEscolhida]}>{titulo}</Text>
      {contador > 0 && (
        <Text style={[estilos.contador, escolhida && estilos.contadorEscolhido]}>{contador}</Text>
      )}
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  abas: { flexDirection: 'row', backgroundColor: cores.branco, borderRadius: 16, padding: 4, gap: 4 },
  aba: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 12 },
  abaEscolhida: { backgroundColor: cores.marca700 },
  abaTexto: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.textoMedio },
  abaTextoEscolhida: { color: cores.branco },
  contador: {
    minWidth: 22,
    textAlign: 'center',
    fontFamily: fontes.textoForte,
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
    color: coresDoStatus.atencao.texto,
    backgroundColor: coresDoStatus.atencao.fundo,
  },
  contadorEscolhido: { color: cores.marca700, backgroundColor: cores.branco },
})
