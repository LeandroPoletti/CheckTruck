import { useCallback, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useCarregarNaTela, useSessao } from '@/servicos/sessao'
import { tiposDeManutencao, type TipoDeManutencao } from '@/servicos/cadastros'
import {
  caminhoesDosIntervalos, intervalosDe, type Alvo, type CaminhaoDoIntervalo, type Intervalo, type IntervalosDoItem, type Origem,
} from '@/servicos/intervalos'
import { formatKm } from '@/dados/formato'
import { COMPONENTES, ORIGENS_INTERVALO, textoDoIntervalo } from '@/dados/intervalos'
import Abas from '@/componentes/Abas'
import Botao from '@/componentes/Botao'
import Etiqueta from '@/componentes/Etiqueta'
import LinhaTocavel from '@/componentes/LinhaTocavel'
import MensagemErro from '@/componentes/MensagemErro'
import Pilula from '@/componentes/Pilula'
import Placa from '@/componentes/Placa'
import TelaComTopo from '@/componentes/TelaComTopo'
import { comTema, cores, coresDoStatus, fontes } from '@/tema'

type Aba = Alvo['tipo']
type Dados = { caminhao: CaminhaoDoIntervalo; tipos: TipoDeManutencao[]; doCaminhao: IntervalosDoItem[]; daGeracao: IntervalosDoItem[] }

const ABAS = [{ id: 'caminhao' as const, titulo: 'Por caminhão' }, { id: 'geracao' as const, titulo: 'Por geração' }]

// Intervalos de troca de um caminhão (permissão Intervalos), igual à tela Intervalos do web. Na aba Por caminhão,
// o intervalo só dele (ex.: plano da concessionária); na Por geração, o da empresa, que vale para todos os caminhões
// da mesma geração. Vale o primeiro que existir: do caminhão → da empresa → de fábrica → padrão do sistema.
// Recarrega ao voltar para a tela (depois de salvar) e ao puxar para baixo.
export default function Intervalos() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { chamar } = useSessao()
  const [aba, setAba] = useState<Aba>('caminhao')
  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState('')
  const [puxando, setPuxando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [caminhoes, tipos, doCaminhao] = await Promise.all([
        caminhoesDosIntervalos(chamar),
        tiposDeManutencao(chamar),
        intervalosDe(chamar, { tipo: 'caminhao', id: Number(id) }),
      ])
      const caminhao = caminhoes.find((c) => c.id === Number(id))
      if (!caminhao) throw new Error('Caminhão não encontrado ou desativado.')
      const daGeracao = await intervalosDe(chamar, { tipo: 'geracao', id: caminhao.geracaoId })
      // Do jeito do web: por componente (Motor, Câmbio...) e, dentro dele, pelo nome
      const ordenados = [...tipos].sort((a, b) => a.componente - b.componente || a.nome.localeCompare(b.nome))
      setDados({ caminhao, tipos: ordenados, doCaminhao, daGeracao })
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar os intervalos.')
    }
  }, [chamar, id])

  useCarregarNaTela(carregar)

  async function puxarParaAtualizar() {
    setPuxando(true)
    await carregar()
    setPuxando(false)
  }

  const daGeracao = aba === 'geracao'
  const geracao = dados && `${dados.caminhao.fabricanteNome} ${dados.caminhao.modeloNome} · ${dados.caminhao.geracaoNome}`

  return (
    <TelaComTopo titulo="Intervalos de troca">
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        refreshControl={<RefreshControl refreshing={puxando} onRefresh={puxarParaAtualizar} tintColor={cores.marca700} />}
      >
        <Text style={estilos.explicacao}>
          Vale o primeiro que existir: do caminhão → da empresa → de fábrica → padrão do sistema. Vence o que chegar primeiro: km ou prazo.
        </Text>
        <Abas abas={ABAS} escolhida={aba} aoEscolher={setAba} />

        {erro !== '' && (
          <View style={estilos.bloco}>
            <MensagemErro>{erro}</MensagemErro>
            <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
          </View>
        )}

        {dados === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

        {dados && geracao && (
          <>
            <View style={estilos.alvo}>
              {daGeracao
                ? <Text style={estilos.alvoNome}>{geracao}</Text>
                : (
                  <View style={estilos.alvoCaminhao}>
                    <Placa placa={dados.caminhao.placa} pequena />
                    <Text style={estilos.alvoNome}>
                      {dados.caminhao.fabricanteNome} {dados.caminhao.modeloNome} {dados.caminhao.potenciaCv}
                    </Text>
                  </View>
                )}
              <Text style={estilos.alvoTexto}>
                {daGeracao
                  ? 'Vale para todos os caminhões desta geração na empresa, menos os que têm intervalo do caminhão.'
                  : 'Vale só para este caminhão e passa na frente dos outros (ex.: plano da concessionária).'}
              </Text>
            </View>

            <View style={estilos.lista}>
              {dados.tipos.map((tipo, i) => (
                <LinhaDoIntervalo
                  key={tipo.id}
                  tipo={tipo}
                  emOrdem={(daGeracao ? dados.daGeracao : dados.doCaminhao).find((l) => l.tipoManutencaoId === tipo.id)?.emOrdem ?? []}
                  minhaOrigem={daGeracao ? 'empresa' : 'caminhao'}
                  primeira={i === 0}
                  onPress={() => router.push({
                    pathname: '/intervalo',
                    params: daGeracao
                      ? { alvo: 'geracao', id: dados.caminhao.geracaoId, nome: geracao, tipoId: tipo.id }
                      : { alvo: 'caminhao', id: dados.caminhao.id, nome: dados.caminhao.placa, tipoId: tipo.id },
                  })}
                />
              ))}
            </View>

            {daGeracao && (
              <View style={estilos.aviso}>
                <Text style={estilos.avisoTexto}>
                  <Text style={estilos.avisoForte}>1ª troca: </Text>
                  quando o registro de manutenção marca primeira troca, o sistema usa o intervalo de amaciamento em vez
                  do padrão. Ex.: Volvo FH 4/5 zero km, câmbio com 200.000 km e diferencial Meritor com 10.000 km.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </TelaComTopo>
  )
}

type PropsDaLinha = { tipo: TipoDeManutencao; emOrdem: Intervalo[]; minhaOrigem: Origem; primeira: boolean; onPress(): void }

// Um item: o intervalo que vale, de onde ele vem e o botão do que dá para fazer (editar o seu ou definir um).
// A linha inteira é tocável.
function LinhaDoIntervalo({ tipo, emOrdem, minhaOrigem, primeira, onPress }: PropsDaLinha) {
  const vale = emOrdem[0]
  const meu = emOrdem.find((i) => i.origem === minhaOrigem)
  // Embaixo do nome: o componente e, no caminhão, a observação dele; na geração, a fonte do que vale
  const extra = minhaOrigem === 'caminhao' ? meu?.observacao : vale?.fonte
  const acao = meu ? 'Editar' : minhaOrigem === 'caminhao' ? 'Definir pro caminhão' : 'Definir pra empresa'

  return (
    <LinhaTocavel primeira={primeira} rotulo={`${tipo.nome}: ${acao}`} onPress={onPress}>
      <View style={estilos.linhaTopo}>
        <Text style={estilos.nome}>{tipo.nome}</Text>
        <EtiquetaDaOrigem origem={vale?.origem} />
      </View>
      <Text style={estilos.meta}>{[COMPONENTES[tipo.componente] ?? tipo.componente, extra].filter(Boolean).join(' · ')}</Text>
      <Text style={estilos.valor}>{vale ? textoDoIntervalo(vale) : 'Sem intervalo'}</Text>
      {minhaOrigem === 'empresa' && !!vale?.intervaloKmPrimeira && (
        <Text style={estilos.primeira}>1ª troca com {formatKm(vale.intervaloKmPrimeira)}</Text>
      )}
      <Pilula icone={meu ? 'edit-2' : 'plus'} titulo={acao} />
    </LinhaTocavel>
  )
}

// De onde vem o intervalo que vale, com as cores do web (o do caminhão é o mais forte)
const CORES_DA_ORIGEM = comTema((): Record<Origem | 'nenhum', { texto: string; fundo: string }> => ({
  caminhao: { texto: cores.branco, fundo: cores.marca700 },
  empresa: { texto: cores.branco, fundo: cores.marca500 },
  fabrica: { texto: cores.marca700, fundo: cores.marca100 },
  padrao: { texto: cores.textoMedio, fundo: cores.fundo },
  nenhum: { texto: coresDoStatus.atencao.texto, fundo: coresDoStatus.atencao.fundo },
}))

function EtiquetaDaOrigem({ origem }: { origem?: Origem }) {
  const nome = origem ? ORIGENS_INTERVALO[origem] : 'não acompanhado'
  return <Etiqueta texto={nome[0].toUpperCase() + nome.slice(1)} cor={CORES_DA_ORIGEM[origem ?? 'nenhum']} />
}

const estilos = comTema(() => StyleSheet.create({
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  explicacao: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 19, color: cores.textoMedio },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
  alvo: { gap: 8 },
  alvoCaminhao: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  alvoNome: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  alvoTexto: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoFraco },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  nome: { flex: 1, fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  meta: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoFraco },
  valor: { fontFamily: fontes.textoMedio, fontSize: 15, color: cores.texto, marginTop: 2 },
  primeira: { fontFamily: fontes.textoForte, fontSize: 13, color: coresDoStatus.atencao.texto },
  aviso: { backgroundColor: coresDoStatus.atencao.fundo, borderRadius: 14, padding: 14 },
  avisoTexto: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 18, color: coresDoStatus.atencao.texto },
  avisoForte: { fontFamily: fontes.textoForte },
}))
