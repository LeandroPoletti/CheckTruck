import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, AppState, Linking, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useCarregarNaTela, useSessao } from '@/servicos/sessao'
import {
  agendarAvisos, avisoDeTeste, caminhoesDosAvisos, pedirPermissao, situacaoDosAvisos, type SituacaoDosAvisos,
} from '@/servicos/avisos'
import { HORA_DO_AVISO, planejarAvisos, type Aviso } from '@/dados/avisos'
import Botao from '@/componentes/Botao'
import MensagemErro from '@/componentes/MensagemErro'
import TelaComTopo from '@/componentes/TelaComTopo'
import { comTema, cores, coresDoStatus, fontes } from '@/tema'

const doisDigitos = (n: number) => String(n).padStart(2, '0')

// "Hoje às 8:00", "Amanhã às 8:00" ou "31/10 às 8:00"
function quandoTexto(d: Date, agora: Date) {
  const dia = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dias = Math.round((dia(d) - dia(agora)) / 86_400_000)
  const data = dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}`
  return `${data} às ${d.getHours()}:${doisDigitos(d.getMinutes())}`
}

// Avisos de troca no celular: se estão ligados neste aparelho, o que vai chegar e um aviso de teste.
// Os avisos são os mesmos que a tela inicial agenda; ligar aqui já agenda. Ao voltar das configurações, confere de novo.
export default function Avisos() {
  const { chamar, usuario } = useSessao()
  const [situacao, setSituacao] = useState<SituacaoDosAvisos | null>(null)
  const [avisos, setAvisos] = useState<Aviso[] | null>(null)
  const [erro, setErro] = useState('')
  const [testou, setTestou] = useState(false)

  const carregar = useCallback(async () => {
    if (!usuario) return
    try {
      const [agora, caminhoes] = await Promise.all([situacaoDosAvisos(), caminhoesDosAvisos(chamar, usuario)])
      setSituacao(agora)
      setAvisos(planejarAvisos(caminhoes))
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar os avisos.')
    }
  }, [chamar, usuario])

  useCarregarNaTela(carregar)
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => { if (estado === 'active') carregar() })
    return () => assinatura.remove()
  }, [carregar])

  async function ligar() {
    if (await pedirPermissao()) await agendarAvisos(avisos ?? [])
    carregar()
  }

  async function testar() {
    await avisoDeTeste()
    setTestou(true)
  }

  const agora = new Date()

  return (
    <TelaComTopo titulo="Avisos de troca">
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <Text style={estilos.explicacao}>
          O celular avisa às {HORA_DO_AVISO}h, todo dia, enquanto tiver troca vencida ou chegando, e no dia em que vence a
          data de uma troca. Os avisos são atualizados toda vez que o app abre.
        </Text>

        <MensagemErro>{erro}</MensagemErro>
        {situacao === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

        {situacao === 'ligados' && (
          <View style={estilos.cartao}>
            <View style={estilos.linhaDoStatus}>
              <Feather name="check-circle" size={22} color={cores.marca700} />
              <Text style={estilos.status}>Avisos ligados neste celular</Text>
            </View>
            <Botao titulo="Mandar um aviso de teste" tipo="discreto" icone="bell" onPress={testar} />
            {testou && <Text style={estilos.dica}>Pronto: o aviso de teste deve aparecer em instantes.</Text>}
          </View>
        )}
        {situacao === 'perguntar' && (
          <View style={estilos.cartao}>
            <View style={estilos.linhaDoStatus}>
              <Feather name="bell-off" size={22} color={coresDoStatus.atencao.texto} />
              <Text style={estilos.status}>Avisos ainda não ligados</Text>
            </View>
            <Botao titulo="Ligar avisos" icone="bell" onPress={ligar} />
          </View>
        )}
        {situacao === 'desligados' && (
          <View style={estilos.cartao}>
            <View style={estilos.linhaDoStatus}>
              <Feather name="bell-off" size={22} color={cores.erroTexto} />
              <Text style={estilos.status}>Avisos desligados</Text>
            </View>
            <Text style={estilos.texto}>Ligue os avisos do CheckTruck nas configurações do celular.</Text>
            <Botao titulo="Abrir configurações" tipo="discreto" icone="settings" onPress={() => Linking.openSettings()} />
          </View>
        )}
        {situacao === 'sem-suporte' && (
          <View style={estilos.cartao}>
            <Text style={estilos.texto}>Os avisos funcionam no app do celular.</Text>
          </View>
        )}

        {avisos && (
          <>
            <Text style={estilos.secao}>Próximos avisos</Text>
            {avisos.length === 0 ? (
              <Text style={estilos.vazio}>Nenhum aviso: está tudo em dia.</Text>
            ) : (
              <View style={estilos.lista}>
                {avisos.map((a, i) => (
                  <View key={a.id} style={[estilos.aviso, i > 0 && estilos.avisoComBorda]}>
                    <Text style={estilos.quando}>{quandoTexto(a.quando, agora)}{a.diario ? ' · todo dia' : ''}</Text>
                    <Text style={estilos.texto}>{a.texto}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </TelaComTopo>
  )
}

const estilos = comTema(() => StyleSheet.create({
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  explicacao: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 19, color: cores.textoMedio },
  carregando: { marginTop: 40 },
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 14 },
  linhaDoStatus: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  status: { flex: 1, fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  texto: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.texto },
  dica: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.marca700 },
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto, marginTop: 6 },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 8 },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
  aviso: { paddingVertical: 14, gap: 4 },
  avisoComBorda: { borderTopWidth: 1, borderTopColor: cores.borda },
  quando: { fontFamily: fontes.textoForte, fontSize: 13, color: cores.marca700 },
}))
