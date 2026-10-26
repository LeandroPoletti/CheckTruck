import { Pressable, StyleSheet, Text, View } from 'react-native'
import { comTema, cores, fontes } from '@/tema'

type Opcao<T> = { id: T; nome: string }

type Props<T> = {
  opcoes: Opcao<T>[]
  escolhidos: NoInfer<T>[]
  aoTocar(id: NoInfer<T>): void
  /** Dá para escolher mais de uma (ex.: os itens da OS). Sem isso, é uma só. */
  multipla?: boolean
}

// Opções em pílulas que quebram linha: a escolhida fica verde (ex.: o tipo do chamado, os itens da OS)
export default function Escolha<T extends string | number>({ opcoes, escolhidos, aoTocar, multipla = false }: Props<T>) {
  return (
    <View style={estilos.opcoes}>
      {opcoes.map((o) => {
        const escolhida = escolhidos.includes(o.id)
        return (
          <Pressable
            key={String(o.id)}
            onPress={() => aoTocar(o.id)}
            style={[estilos.opcao, escolhida && estilos.escolhida]}
            accessibilityRole={multipla ? 'checkbox' : 'radio'}
            accessibilityState={multipla ? { checked: escolhida } : { selected: escolhida }}
          >
            <Text style={[estilos.texto, escolhida && estilos.textoEscolhido]}>{o.nome}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: cores.fundo },
  escolhida: { backgroundColor: cores.marca700 },
  texto: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.texto },
  textoEscolhido: { color: cores.branco },
}))
