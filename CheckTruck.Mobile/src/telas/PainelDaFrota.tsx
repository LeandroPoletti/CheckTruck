import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSessao, type Usuario } from '@/servicos/sessao'
import { caminhoesDaFrota, situacaoDoCaminhao, type Caminhao, type CaminhaoNaLista } from '@/servicos/caminhoes'
import { listarChamados, type Chamado } from '@/servicos/chamados'
import { kmDaMaiorOs, listarOrdens, type OrdemDeServico } from '@/servicos/ordens'
import Botao from '@/componentes/Botao'
import MensagemErro from '@/componentes/MensagemErro'
import Saudacao from '@/componentes/Saudacao'
import SituacaoDoCaminhao from '@/componentes/SituacaoDoCaminhao'
import CaminhoesDaFrota from './CaminhoesDaFrota'
import ChamadosDaFrota from './ChamadosDaFrota'
import OrdensDaFrota from './OrdensDaFrota'
import { cores, coresDoStatus, fontes } from '@/tema'

type Aba = 'caminhoes' | 'chamados' | 'ordens'

// Tela de quem cuida da frota (mecânico, chefe de manutenção, gestor...) e do Autônomo. Mostra o que o acesso libera,
// igual ao web: Ver frota mostra os caminhões e as ordens de serviço, e Atender chamados (só na Frota) mostra os
// chamados. Com mais de uma, troca nas abas de cima. O Autônomo com um caminhão só já vê a situação dele, sem a lista.
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
  const [ordens, setOrdens] = useState<OrdemDeServico[] | null>(null)
  const [erro, setErro] = useState('')
  const [puxando, setPuxando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [frota, lista, os] = await Promise.all([
        verFrota ? caminhoesDaFrota(chamar) : Promise.resolve([]),
        atender ? listarChamados(chamar) : Promise.resolve([]),
        verFrota ? listarOrdens(chamar) : Promise.resolve([]),
      ])
      const so = autonomo && frota.length === 1 && frota[0].ativo ? await situacaoDoCaminhao(chamar, frota[0].id) : null
      setCaminhoes(frota)
      setUnico(so)
      setChamados(lista)
      setOrdens(os)
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
  const abas: PropsDaAba[] = [
    ...(verFrota ? [{ id: 'caminhoes' as const, titulo: unico ? 'Caminhão' : 'Caminhões' }] : []),
    ...(atender ? [{ id: 'chamados' as const, titulo: 'Chamados', contador: pendentes }] : []),
    ...(verFrota ? [{ id: 'ordens' as const, titulo: 'OS' }] : []),
  ]

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <Saudacao usuario={usuario} aoSair={sair} />

      <View style={estilos.corpo}>
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={puxando} onRefresh={puxarParaAtualizar} tintColor={cores.marca700} />}
        >
          {abas.length > 1 && (
            <View style={estilos.abas} accessibilityRole="tablist">
              {abas.map((a) => <BotaoDaAba key={a.id} {...a} escolhida={aba === a.id} aoEscolher={setAba} />)}
            </View>
          )}

          {erro !== '' && (
            <View style={estilos.bloco}>
              <MensagemErro>{erro}</MensagemErro>
              <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
            </View>
          )}

          {(caminhoes === null || chamados === null || ordens === null) && erro === '' && (
            <ActivityIndicator style={estilos.carregando} color={cores.marca700} />
          )}

          {aba === 'caminhoes' && caminhoes && (unico ? (
            <>
              <SituacaoDoCaminhao
                caminhao={unico}
                podeAtualizarKm={usuario.permissoes.includes('AtualizarKm')}
                mostrarMotorista={false}
                falarComOficina
                podeLancarOS={usuario.permissoes.includes('OrdemServico')}
                kmMinimoParaCorrigir={
                  usuario.cuidaDosAcessos ? kmDaMaiorOs((ordens ?? []).filter((os) => os.veiculo?.id === unico.id)) : undefined
                }
              />
              <Atalho
                icone="clock"
                titulo="Histórico e dados do caminhão"
                onPress={() => router.push({ pathname: '/caminhao/[id]', params: { id: unico.id } })}
              />
              {usuario.permissoes.includes('Veiculos') && (
                <Atalho icone="plus" titulo="Cadastrar outro caminhão" onPress={() => router.push('/cadastro-caminhao')} />
              )}
            </>
          ) : (
            <CaminhoesDaFrota
              caminhoes={caminhoes}
              mostrarMotorista={!autonomo}
              podeCadastrar={usuario.permissoes.includes('Veiculos')}
            />
          ))}
          {aba === 'chamados' && chamados && (
            <ChamadosDaFrota chamados={chamados} usuario={usuario} aoMudar={carregar} />
          )}
          {aba === 'ordens' && ordens && <OrdensDaFrota ordens={ordens} usuario={usuario} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

// Linha que leva para outra tela (ex.: o histórico do caminhão, no Autônomo com um caminhão só)
function Atalho({ icone, titulo, onPress }: { icone: keyof typeof Feather.glyphMap; titulo: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [estilos.atalho, pressed && estilos.atalhoApertado]} accessibilityRole="button">
      <Feather name={icone} size={18} color={cores.marca700} />
      <Text style={estilos.atalhoTexto}>{titulo}</Text>
      <Feather name="chevron-right" size={20} color={cores.textoFraco} />
    </Pressable>
  )
}

type PropsDaAba = { id: Aba; titulo: string; contador?: number }

function BotaoDaAba({ id, titulo, contador = 0, escolhida, aoEscolher }: PropsDaAba & { escolhida: boolean; aoEscolher(id: Aba): void }) {
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
  tela: { flex: 1, backgroundColor: cores.marca900 },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, overflow: 'hidden' },
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
  atalho: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: cores.branco, borderRadius: 16, padding: 16 },
  atalhoApertado: { backgroundColor: cores.marca50 },
  atalhoTexto: { flex: 1, fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
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
