import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import FaixaDaEstrada from './FaixaDaEstrada'
import { comTema, cores, fontes } from '@/tema'

type Props = {
  titulo: string
  /** Uma linha embaixo do título (ex.: "Dados da conta no CheckTruck"). */
  subtitulo?: string
  /** Com isso, aparece o botão Editar no canto de cima (ex.: editar o caminhão, quem tem a permissão). */
  aoEditar?: () => void
  children: ReactNode
}

// Telas que abrem por cima da inicial (o caminhão, os intervalos, os cadastros...): topo verde com o voltar,
// o título e a faixa da estrada (e o Editar, quando tem), e o corpo cinza arredondado embaixo (o conteúdo vem em children)
export default function TelaComTopo({ titulo, subtitulo, aoEditar, children }: Props) {
  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <View style={estilos.cabecalho}>
        <View style={estilos.topo}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar" style={estilos.voltar}>
            <Feather name="arrow-left" size={20} color={cores.sobreTopo2} />
          </Pressable>
          {aoEditar && (
            <Pressable onPress={aoEditar} hitSlop={12} accessibilityRole="button" style={estilos.editar}>
              <Feather name="edit-2" size={16} color={cores.sobreTopo2} />
              <Text style={estilos.editarTexto}>Editar</Text>
            </Pressable>
          )}
        </View>
        <Text style={estilos.titulo}>{titulo}</Text>
        <FaixaDaEstrada />
        {!!subtitulo && <Text style={estilos.subtitulo}>{subtitulo}</Text>}
      </View>
      <View style={estilos.corpo}>{children}</View>
    </SafeAreaView>
  )
}

const estilos = comTema(() => StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.topo },
  cabecalho: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, gap: 12 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voltar: { alignSelf: 'flex-start', padding: 8, borderRadius: 999, backgroundColor: cores.topoForte },
  editar: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: cores.topoForte,
  },
  editarTexto: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.sobreTopo2 },
  titulo: { fontFamily: fontes.titulo, fontSize: 32, lineHeight: 36, color: cores.sobreTopo },
  subtitulo: { fontFamily: fontes.texto, fontSize: 14, color: cores.sobreTopo2 },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, overflow: 'hidden' },
}))
