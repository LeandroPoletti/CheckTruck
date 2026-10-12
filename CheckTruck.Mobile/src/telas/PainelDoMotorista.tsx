import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSessao, type Usuario } from '@/servicos/sessao'
import { meusCaminhoes, meusChamados, type Caminhao, type Chamado, type ItemDeTroca } from '@/servicos/motorista'
import { formatData, formatDataHora, formatKm, textoDias, textoKmRestante } from '@/dados/formato'
import { nomeTipoOcorrencia, nomeUrgencia } from '@/dados/chamados'
import BarraDeUso from '@/componentes/BarraDeUso'
import Botao from '@/componentes/Botao'
import EtiquetaStatus from '@/componentes/EtiquetaStatus'
import MensagemErro from '@/componentes/MensagemErro'
import Placa from '@/componentes/Placa'
import Saudacao from '@/componentes/Saudacao'
import { cores, coresDoStatus, fontes } from '@/tema'

// Tela do motorista: o caminhão que está com ele (próximas trocas em km e data), atualizar o km e os chamados.
// Recarrega sempre que a tela volta a aparecer (ex.: depois de atualizar o km) e ao puxar para baixo.
export default function PainelDoMotorista({ usuario }: { usuario: Usuario }) {
  const { chamar, sair } = useSessao()
  const podeAbrirChamado = usuario.tipoConta === 'Frota' && usuario.permissoes.includes('AbrirChamados')
  const [caminhoes, setCaminhoes] = useState<Caminhao[] | null>(null)
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [escolhidoId, setEscolhidoId] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [puxando, setPuxando] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [lista, abertos] = await Promise.all([
        meusCaminhoes(chamar),
        podeAbrirChamado ? meusChamados(chamar) : Promise.resolve([]),
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

          {caminhao && (
            <>
              <CartaoDoCaminhao caminhao={caminhao} />
              <ResumoDoStatus caminhao={caminhao} />

              <Text style={estilos.secao}>Próximas trocas</Text>
              <View style={estilos.lista}>
                {caminhao.itens.map((item, i) => (
                  <LinhaDaTroca key={item.tipoManutencaoId} item={item} primeira={i === 0} />
                ))}
              </View>
            </>
          )}

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
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

function CartaoDoCaminhao({ caminhao }: { caminhao: Caminhao }) {
  return (
    <View style={estilos.cartao}>
      <Placa placa={caminhao.placa} />
      <View>
        <Text style={estilos.modelo}>{caminhao.fabricante} {caminhao.modelo.nome}</Text>
        <Text style={estilos.detalhe}>{caminhao.geracao.nome}, {caminhao.potenciaCv} cv</Text>
      </View>
      <View style={estilos.divisoria} />
      <View>
        <Text style={estilos.rotulo}>Km atual</Text>
        <Text style={estilos.km}>{formatKm(caminhao.kmAtual)}</Text>
      </View>
      <Botao
        titulo="Atualizar km"
        icone="navigation"
        onPress={() => router.push({
          pathname: '/atualizar-km',
          params: { id: caminhao.id, placa: caminhao.placa, km: caminhao.kmAtual },
        })}
      />
    </View>
  )
}

// Faixa com o resumo: quantas trocas venceram ou estão chegando
function ResumoDoStatus({ caminhao }: { caminhao: Caminhao }) {
  const vencidas = caminhao.itens.filter((i) => i.status === 'critico').length
  const chegando = caminhao.itens.filter((i) => i.status === 'atencao').length
  const status = vencidas > 0 ? 'critico' : chegando > 0 ? 'atencao' : 'ok'
  const cor = coresDoStatus[status]
  const [icone, titulo, texto] =
    vencidas > 0
      ? (['alert-octagon', `${vencidas} ${vencidas === 1 ? 'troca vencida' : 'trocas vencidas'}`, 'Fale com a oficina para fazer a troca.'] as const)
      : chegando > 0
        ? (['alert-triangle', `${chegando} ${chegando === 1 ? 'troca chegando' : 'trocas chegando'}`, 'Já dá para combinar com a oficina.'] as const)
        : (['check-circle', 'Tudo em dia', 'Nenhuma troca perto de vencer.'] as const)

  return (
    <View style={[estilos.resumo, { backgroundColor: cor.fundo }]}>
      <Feather name={icone} size={22} color={cor.texto} />
      <View style={estilos.resumoTextos}>
        <Text style={[estilos.resumoTitulo, { color: cor.texto }]}>{titulo}</Text>
        <Text style={[estilos.resumoTexto, { color: cor.texto }]}>{texto}</Text>
      </View>
    </View>
  )
}

function LinhaDaTroca({ item, primeira }: { item: ItemDeTroca; primeira: boolean }) {
  const quando = [
    `Próxima troca com ${formatKm(item.kmProximaTroca)}`,
    item.dataProximaTroca && item.diasRestantes !== null
      ? ` ou em ${formatData(item.dataProximaTroca)} (${textoDias(item.diasRestantes)})`
      : '',
    item.isPrimeiraTroca ? '. É a 1ª troca.' : '',
  ].join('')

  return (
    <View style={[estilos.troca, !primeira && estilos.trocaComLinha]}>
      <View style={estilos.trocaTopo}>
        <Text style={estilos.trocaNome}>{item.tipoManutencaoNome}</Text>
        <EtiquetaStatus status={item.status} />
      </View>
      <Text style={[estilos.trocaKm, item.status !== 'ok' && { color: coresDoStatus[item.status].texto }]}>
        {textoKmRestante(item.kmRestante)}
      </Text>
      <BarraDeUso percentual={item.percentualUsado} status={item.status} />
      <Text style={estilos.trocaQuando}>{quando}</Text>
    </View>
  )
}

function CartaoDoChamado({ chamado }: { chamado: Chamado }) {
  const concluido = chamado.status === 'Concluido'
  return (
    <View style={estilos.chamado}>
      <View style={estilos.trocaTopo}>
        <Text style={estilos.trocaNome}>{nomeTipoOcorrencia(chamado.tipo)}</Text>
        <Text style={[estilos.chamadoStatus, concluido ? estilos.chamadoConcluido : estilos.chamadoPendente]}>
          {concluido ? 'Concluído' : 'Pendente'}
        </Text>
      </View>
      <Text style={estilos.chamadoMeta}>
        Aberto em {formatDataHora(chamado.abertoEm)}, urgência {nomeUrgencia(chamado.urgencia).toLowerCase()}
      </Text>
      <Text style={estilos.chamadoDescricao} numberOfLines={3}>{chamado.descricao}</Text>
      {!concluido && chamado.atendidoPor && (
        <Text style={estilos.chamadoNota}>{chamado.atendidoPor.nome} está cuidando.</Text>
      )}
      {concluido && chamado.solucao && <Text style={estilos.chamadoNota}>O que foi feito: {chamado.solucao}</Text>}
    </View>
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
  modelo: { fontFamily: fontes.textoForte, fontSize: 17, color: cores.texto },
  detalhe: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, marginTop: 2 },
  divisoria: { height: 1, backgroundColor: cores.borda },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  km: { fontFamily: fontes.titulo, fontSize: 34, lineHeight: 38, color: cores.texto, marginTop: 2 },
  resumo: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16 },
  resumoTextos: { flex: 1, gap: 2 },
  resumoTitulo: { fontFamily: fontes.textoForte, fontSize: 15 },
  resumoTexto: { fontFamily: fontes.texto, fontSize: 13 },
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto, marginTop: 6 },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
  troca: { paddingVertical: 16, gap: 8 },
  trocaComLinha: { borderTopWidth: 1, borderTopColor: cores.borda },
  trocaTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  trocaNome: { flex: 1, fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  trocaKm: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.texto },
  trocaQuando: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoFraco },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 8 },
  chamado: { backgroundColor: cores.branco, borderRadius: 16, padding: 16, gap: 6 },
  chamadoStatus: { fontFamily: fontes.textoForte, fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  chamadoPendente: { color: coresDoStatus.atencao.texto, backgroundColor: coresDoStatus.atencao.fundo },
  chamadoConcluido: { color: coresDoStatus.ok.texto, backgroundColor: coresDoStatus.ok.fundo },
  chamadoMeta: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoFraco },
  chamadoDescricao: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.texto },
  chamadoNota: { fontFamily: fontes.textoMedio, fontSize: 13, lineHeight: 18, color: cores.marca700 },
  iconeVazio: { width: 48, height: 48, borderRadius: 14, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' },
  vazioTitulo: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto },
  vazioTexto: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.textoFraco },
})
