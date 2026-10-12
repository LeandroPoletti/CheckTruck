import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSessao } from '@/servicos/sessao'
import { situacaoDoCaminhao, type Caminhao } from '@/servicos/caminhoes'
import Botao from '@/componentes/Botao'
import CartaoDoCaminhao from '@/componentes/CartaoDoCaminhao'
import FaixaDaEstrada from '@/componentes/FaixaDaEstrada'
import ListaDeTrocas from '@/componentes/ListaDeTrocas'
import MensagemErro from '@/componentes/MensagemErro'
import ResumoDoStatus from '@/componentes/ResumoDoStatus'
import { cores, fontes } from '@/tema'

// Situação completa de um caminhão da frota (a mesma do detalhe no web), com Atualizar km para quem tem a permissão.
// Recarrega ao voltar para a tela (ex.: depois de atualizar o km) e ao puxar para baixo.
export default function DetalheDoCaminhao() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { chamar, usuario } = useSessao()
  const [caminhao, setCaminhao] = useState<Caminhao | null>(null)
  const [erro, setErro] = useState('')
  const [puxando, setPuxando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      setCaminhao(await situacaoDoCaminhao(chamar, Number(id)))
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar o caminhão.')
    }
  }, [chamar, id])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  async function puxarParaAtualizar() {
    setPuxando(true)
    await carregar()
    setPuxando(false)
  }

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <View style={estilos.cabecalho}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar" style={estilos.voltar}>
          <Feather name="arrow-left" size={20} color={cores.marca200} />
        </Pressable>
        <Text style={estilos.titulo}>Situação do caminhão</Text>
        <FaixaDaEstrada />
      </View>

      <View style={estilos.corpo}>
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          refreshControl={<RefreshControl refreshing={puxando} onRefresh={puxarParaAtualizar} tintColor={cores.marca700} />}
        >
          {erro !== '' && (
            <View style={estilos.bloco}>
              <MensagemErro>{erro}</MensagemErro>
              <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
            </View>
          )}

          {caminhao === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

          {caminhao && (
            <>
              <CartaoDoCaminhao
                caminhao={caminhao}
                podeAtualizarKm={!!usuario?.permissoes.includes('AtualizarKm')}
                mostrarMotorista
              />
              <ResumoDoStatus itens={caminhao.itens} doMotorista={false} />

              <Text style={estilos.secao}>Próximas trocas</Text>
              <ListaDeTrocas itens={caminhao.itens} />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.marca900 },
  cabecalho: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, gap: 12 },
  voltar: { alignSelf: 'flex-start', padding: 8, borderRadius: 999, backgroundColor: cores.marca800 },
  titulo: { fontFamily: fontes.titulo, fontSize: 32, lineHeight: 36, color: cores.branco },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, overflow: 'hidden' },
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto, marginTop: 6 },
})
