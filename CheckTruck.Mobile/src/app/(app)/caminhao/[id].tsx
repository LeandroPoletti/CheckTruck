import { useCallback, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSessao } from '@/servicos/sessao'
import { historicoDeKm, situacaoDoCaminhao, type Caminhao, type RegistroDeKm } from '@/servicos/caminhoes'
import { kmDaMaiorOs, maisNovaPrimeiro, ordensDoCaminhao, type OrdemDeServico } from '@/servicos/ordens'
import { formatDataHora, formatKm } from '@/dados/formato'
import { ORIGENS_KM } from '@/dados/caminhoes'
import Atalho from '@/componentes/Atalho'
import Botao from '@/componentes/Botao'
import CartaoDaOrdem from '@/componentes/CartaoDaOrdem'
import MensagemErro from '@/componentes/MensagemErro'
import SituacaoDoCaminhao from '@/componentes/SituacaoDoCaminhao'
import TelaComTopo from '@/componentes/TelaComTopo'
import { comTema, cores, coresDoStatus, fontes } from '@/tema'

type Dados = { caminhao: Caminhao; ordens: OrdemDeServico[]; historico: RegistroDeKm[] }

// Tudo de um caminhão, igual ao detalhe no web: a situação (com Atualizar km e Lançar OS), o histórico de manutenções
// e o histórico de km. Editar (permissão Veículos), Corrigir km (Admin e Gestor) e Intervalos de troca para quem pode.
// Recarrega ao voltar para a tela (ex.: depois de atualizar o km) e ao puxar para baixo.
export default function DetalheDoCaminhao() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { chamar, usuario } = useSessao()
  const pode = (permissao: string) => !!usuario?.permissoes.includes(permissao)
  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState('')
  const [puxando, setPuxando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [caminhao, ordens, historico] = await Promise.all([
        situacaoDoCaminhao(chamar, Number(id)),
        ordensDoCaminhao(chamar, Number(id)),
        historicoDeKm(chamar, Number(id)),
      ])
      setDados({ caminhao, ordens: [...ordens].sort(maisNovaPrimeiro), historico })
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
    <TelaComTopo
      titulo="Situação do caminhão"
      aoEditar={pode('Veiculos') && dados
        ? () => router.push({ pathname: '/cadastro-caminhao', params: { id: dados.caminhao.id } })
        : undefined}
    >
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

        {dados === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

        {dados && (
          <>
            {!dados.caminhao.ativo && (
              <View style={estilos.desativado}>
                <Feather name="pause-circle" size={20} color={cores.textoMedio} />
                <Text style={estilos.desativadoTexto}>
                  Caminhão desativado: fica fora da OS e dos chamados. Para voltar a usar, edite e ligue Ativo.
                </Text>
              </View>
            )}

            <SituacaoDoCaminhao
              caminhao={dados.caminhao}
              podeAtualizarKm={pode('AtualizarKm')}
              mostrarMotorista
              falarComOficina={false}
              podeLancarOS={pode('OrdemServico') && dados.caminhao.ativo}
              kmMinimoParaCorrigir={usuario?.cuidaDosAcessos ? kmDaMaiorOs(dados.ordens) : undefined}
            />
            {pode('Intervalos') && dados.caminhao.ativo && (
              <Atalho
                icone="sliders"
                titulo="Intervalos de troca"
                onPress={() => router.push({ pathname: '/intervalos', params: { id: dados.caminhao.id } })}
              />
            )}

            <Text style={estilos.secao}>Histórico de manutenções</Text>
            {dados.ordens.length === 0
              ? <Text style={estilos.vazio}>Nenhuma manutenção registrada ainda.</Text>
              : dados.ordens.map((os) => <CartaoDaOrdem key={os.id} os={os} mostrarPlaca={false} />)}

            <Text style={estilos.secao}>Histórico de km</Text>
            {dados.historico.length === 0
              ? <Text style={estilos.vazio}>Nenhuma mudança de km registrada ainda.</Text>
              : (
                <View style={estilos.lista}>
                  {dados.historico.map((h, i) => <LinhaDoKm key={h.id} registro={h} primeira={i === 0} />)}
                </View>
              )}
          </>
        )}
      </ScrollView>
    </TelaComTopo>
  )
}

// "OS nº 12" quando foi uma OS (ou "OS excluída", se ela saiu); o resto pelo nome da origem
function textoDaOrigem(h: RegistroDeKm) {
  if (h.origem !== 'OrdemServico') return ORIGENS_KM[h.origem] ?? h.origem
  return h.ordemServicoId ? `OS nº ${h.ordemServicoId}` : 'OS excluída'
}

function LinhaDoKm({ registro: h, primeira }: { registro: RegistroDeKm; primeira: boolean }) {
  const diferenca = h.kmAnterior === null ? null : h.kmNovo - h.kmAnterior
  const correcao = h.origem === 'Correcao'
  return (
    <View style={[estilos.linhaKm, !primeira && estilos.linhaKmComLinha]}>
      <View style={estilos.linhaKmTopo}>
        <Text style={[estilos.origem, correcao && estilos.correcao]}>{textoDaOrigem(h)}</Text>
        <Text style={estilos.meta}>{formatDataHora(h.registradoEm)}</Text>
      </View>
      <Text style={estilos.kmTexto}>
        {h.kmAnterior === null ? formatKm(h.kmNovo) : `${formatKm(h.kmAnterior)} → ${formatKm(h.kmNovo)}`}
        {diferenca !== null && (
          <Text style={[estilos.meta, diferenca < 0 && estilos.correcao]}>
            {`  (${diferenca > 0 ? '+' : '−'}${formatKm(Math.abs(diferenca))})`}
          </Text>
        )}
      </Text>
      {!!h.motivo && <Text style={estilos.detalhe}>Motivo: {h.motivo}</Text>}
      {h.registradoPor && <Text style={estilos.meta}>por {h.registradoPor.nome}</Text>}
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
  desativado: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16, backgroundColor: cores.borda },
  desativadoTexto: { flex: 1, fontFamily: fontes.textoMedio, fontSize: 13, lineHeight: 18, color: cores.textoMedio },
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto, marginTop: 6 },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 8 },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
  linhaKm: { paddingVertical: 14, gap: 4 },
  linhaKmComLinha: { borderTopWidth: 1, borderTopColor: cores.borda },
  linhaKmTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  origem: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  correcao: { color: coresDoStatus.atencao.texto },
  meta: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoFraco },
  kmTexto: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.texto },
  detalhe: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoMedio },
}))
