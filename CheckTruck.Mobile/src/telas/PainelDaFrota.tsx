import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { useSessao, type Usuario } from '@/servicos/sessao'
import { caminhoesDaFrota, situacaoDoCaminhao, type Caminhao, type CaminhaoNaLista } from '@/servicos/caminhoes'
import { listarChamados, type Chamado } from '@/servicos/chamados'
import Botao from '@/componentes/Botao'
import MensagemErro from '@/componentes/MensagemErro'
import Saudacao from '@/componentes/Saudacao'
import SituacaoDoCaminhao from '@/componentes/SituacaoDoCaminhao'
import CaminhoesDaFrota from './CaminhoesDaFrota'
import ChamadosDaFrota from './ChamadosDaFrota'
import { cores, coresDoStatus, fontes } from '@/tema'

type Aba = 'caminhoes' | 'chamados'

// Tela de quem cuida da frota (mecânico, chefe de manutenção, gestor...) e do Autônomo. Mostra o que o acesso libera,
// igual ao web: Ver frota mostra os caminhões e Atender chamados (só na Frota) mostra os chamados. Com os dois, troca
// nas abas de cima. O Autônomo com um caminhão só já vê a situação dele, sem a lista.
// Recarrega sempre que a tela volta a aparecer (ex.: depois de resolver um chamado) e ao puxar para baixo.
export default function PainelDaFrota({ usuario }: { usuario: Usuario }) {
  const { chamar, sair } = useSessao()
  const autonomo = usuario.tipoConta === 'Autonomo'
  const verFrota = usuario.permissoes.includes('VerFrota')
  const atender = usuario.tipoConta === 'Frota' && usuario.permissoes.includes('AtenderChamados')
  const [aba, setAba] = useState<Aba>(verFrota ? 'caminhoes' : 'chamados')
  const [caminhoes, setCaminhoes] = useState<CaminhaoNaLista[] | null>(null)
  const [unico, setUnico] = useState<Caminhao | null>(null)
  const [chamados, setChamados] = useState<Chamado[] | null>(null)
  const [erro, setErro] = useState('')
  const [puxando, setPuxando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [frota, lista] = await Promise.all([
        verFrota ? caminhoesDaFrota(chamar) : Promise.resolve([]),
        atender ? listarChamados(chamar) : Promise.resolve([]),
      ])
      const so = autonomo && frota.length === 1 ? await situacaoDoCaminhao(chamar, frota[0].id) : null
      setCaminhoes(frota)
      setUnico(so)
      setChamados(lista)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar.')
    }
  }, [chamar, autonomo, verFrota, atender])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  async function puxarParaAtualizar() {
    setPuxando(true)
    await carregar()
    setPuxando(false)
  }

  const pendentes = chamados?.filter((c) => c.status === 'Pendente').length ?? 0

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <Saudacao usuario={usuario} aoSair={sair} />

      <View style={estilos.corpo}>
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={puxando} onRefresh={puxarParaAtualizar} tintColor={cores.marca700} />}
        >
          {verFrota && atender && (
            <View style={estilos.abas} accessibilityRole="tablist">
              <BotaoDaAba titulo="Caminhões" escolhida={aba === 'caminhoes'} onPress={() => setAba('caminhoes')} />
              <BotaoDaAba titulo="Chamados" contador={pendentes} escolhida={aba === 'chamados'} onPress={() => setAba('chamados')} />
            </View>
          )}

          {erro !== '' && (
            <View style={estilos.bloco}>
              <MensagemErro>{erro}</MensagemErro>
              <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
            </View>
          )}

          {(caminhoes === null || chamados === null) && erro === '' && (
            <ActivityIndicator style={estilos.carregando} color={cores.marca700} />
          )}

          {aba === 'caminhoes' && caminhoes && (unico ? (
            <SituacaoDoCaminhao
              caminhao={unico}
              podeAtualizarKm={usuario.permissoes.includes('AtualizarKm')}
              mostrarMotorista={false}
              falarComOficina
            />
          ) : (
            <CaminhoesDaFrota caminhoes={caminhoes} mostrarMotorista={!autonomo} />
          ))}
          {aba === 'chamados' && chamados && (
            <ChamadosDaFrota chamados={chamados} usuario={usuario} aoMudar={carregar} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

type PropsDaAba = { titulo: string; contador?: number; escolhida: boolean; onPress(): void }

function BotaoDaAba({ titulo, contador = 0, escolhida, onPress }: PropsDaAba) {
  return (
    <Pressable
      onPress={onPress}
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
  tela: { flex: 1, backgroundColor: cores.marca900 },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, overflow: 'hidden' },
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
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
