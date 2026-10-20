import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSessao, type Usuario } from '@/servicos/sessao'
import { meusCaminhoes, type Caminhao } from '@/servicos/caminhoes'
import { listarChamados, type Chamado } from '@/servicos/chamados'
import Atalho from '@/componentes/Atalho'
import Botao from '@/componentes/Botao'
import CartaoDoChamado from '@/componentes/CartaoDoChamado'
import MensagemErro from '@/componentes/MensagemErro'
import Saudacao from '@/componentes/Saudacao'
import SituacaoDoCaminhao from '@/componentes/SituacaoDoCaminhao'
import { cores, fontes } from '@/tema'

// Tela do motorista: o caminhão que está com ele (próximas trocas em km e data), atualizar o km, os chamados e, no
// fim, os avisos de troca do celular.
// Recarrega sempre que a tela volta a aparecer (ex.: depois de atualizar o km) e ao puxar para baixo.
export default function PainelDoMotorista({ usuario }: { usuario: Usuario }) {
  const { chamar, sair } = useSessao()
  const podeAbrirChamado = usuario.permissoes.includes('AbrirChamados')
  const [caminhoes, setCaminhoes] = useState<Caminhao[] | null>(null)
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [escolhidoId, setEscolhidoId] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [puxando, setPuxando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [lista, abertos] = await Promise.all([
        meusCaminhoes(chamar),
        podeAbrirChamado ? listarChamados(chamar) : Promise.resolve([]),
      ])
      setCaminhoes(lista)
      setChamados(abertos)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar.')
    }
  }, [chamar, podeAbrirChamado])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  async function puxarParaAtualizar() {
    setPuxando(true)
    await carregar()
    setPuxando(false)
  }

  const caminhao = caminhoes?.find((c) => c.id === escolhidoId) ?? caminhoes?.[0]

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <Saudacao usuario={usuario} aoSair={sair} />

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

          {caminhoes === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

          {caminhoes?.length === 0 && <SemCaminhao />}

          {caminhoes && caminhoes.length > 1 && (
            <View style={estilos.placas}>
              {caminhoes.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setEscolhidoId(c.id)}
                  style={[estilos.placaOpcao, c.id === caminhao?.id && estilos.placaOpcaoEscolhida]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: c.id === caminhao?.id }}
                >
                  <Text style={[estilos.placaOpcaoTexto, c.id === caminhao?.id && estilos.placaOpcaoTextoEscolhida]}>{c.placa}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {caminhao && <SituacaoDoCaminhao caminhao={caminhao} podeAtualizarKm mostrarMotorista={false} falarComOficina />}

          {caminhao && podeAbrirChamado && (
            <>
              <Text style={estilos.secao}>Seus chamados</Text>
              <Botao
                titulo="Abrir chamado"
                icone="message-square"
                onPress={() => router.push({ pathname: '/abrir-chamado', params: { id: caminhao.id, placa: caminhao.placa } })}
              />
              {chamados.length === 0
                ? <Text style={estilos.vazio}>Você ainda não abriu nenhum chamado.</Text>
                : chamados.slice(0, 5).map((c) => <CartaoDoChamado key={c.id} chamado={c} />)}
            </>
          )}

          {caminhao && <Atalho icone="bell" titulo="Avisos de troca" onPress={() => router.push('/avisos')} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

function SemCaminhao() {
  return (
    <View style={estilos.cartao}>
      <View style={estilos.iconeVazio}>
        <Feather name="truck" size={24} color={cores.textoFraco} />
      </View>
      <Text style={estilos.vazioTitulo}>Nenhum caminhão está com você</Text>
      <Text style={estilos.vazioTexto}>
        Peça ao gestor para colocar seu nome no caminhão. Depois, puxe a tela para baixo para atualizar.
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.marca900 },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, overflow: 'hidden' },
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
  placas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  placaOpcao: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: cores.branco, borderWidth: 1, borderColor: cores.borda },
  placaOpcaoEscolhida: { backgroundColor: cores.marca700, borderColor: cores.marca700 },
  placaOpcaoTexto: { fontFamily: fontes.subtitulo, fontSize: 16, color: cores.texto, letterSpacing: 0.5 },
  placaOpcaoTextoEscolhida: { color: cores.branco },
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 14 },
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto, marginTop: 6 },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 8 },
  iconeVazio: { width: 48, height: 48, borderRadius: 14, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' },
  vazioTitulo: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto },
  vazioTexto: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.textoFraco },
})
