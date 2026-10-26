import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { abrirChamado, caminhoesDoChamado, type Chamado } from '@/servicos/chamados'
import { TIPOS_OCORRENCIA, URGENCIAS } from '@/dados/chamados'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import Escolha from '@/componentes/Escolha'
import MensagemErro from '@/componentes/MensagemErro'
import { comTema, cores, fontes } from '@/tema'

// Conta um problema do caminhão, e quem atende chamados vê no web e no app. O motorista abre do caminhão dele (a placa
// já vem); pela aba Chamados (admin, gestor, quem tem Abrir chamados) escolhe o caminhão, igual ao web.
export default function AbrirChamado() {
  const { id, placa } = useLocalSearchParams<{ id?: string; placa?: string }>()
  const { chamar } = useSessao()
  const [caminhoes, setCaminhoes] = useState<{ id: number; nome: string }[] | null>(null)
  const [erroCarga, setErroCarga] = useState('')
  const [veiculoId, setVeiculoId] = useState<number | null>(id ? Number(id) : null)
  const [tipo, setTipo] = useState<string | null>(null)
  const [urgencia, setUrgencia] = useState<Chamado['urgencia']>('Media')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (id) return
    caminhoesDoChamado(chamar)
      .then((lista) => setCaminhoes(lista.map((c) => ({ id: c.id, nome: c.placa }))))
      .catch((e) => setErroCarga(`Não foi possível carregar os caminhões: ${e instanceof Error ? e.message : ''}`))
  }, [chamar, id])

  async function enviar() {
    if (!veiculoId) {
      setErro('Escolha o caminhão.')
      return
    }
    if (!tipo) {
      setErro('Escolha o que está acontecendo.')
      return
    }
    if (!descricao.trim()) {
      setErro('Conte o que aconteceu.')
      return
    }
    setEnviando(true)
    setErro('')
    try {
      await abrirChamado(chamar, { veiculoId, tipo, urgencia, descricao })
      router.back()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível abrir o chamado.')
      setEnviando(false)
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoDoModal titulo="Abrir chamado" placa={placa} />

          {!id && (
            <View style={estilos.grupo}>
              <Text style={estilos.rotulo}>Caminhão</Text>
              {caminhoes === null && !erroCarga && <ActivityIndicator color={cores.marca700} />}
              {caminhoes?.length === 0 && <Text style={estilos.vazio}>Nenhum caminhão ativo.</Text>}
              {!!caminhoes?.length && (
                <Escolha opcoes={caminhoes} escolhidos={veiculoId ? [veiculoId] : []} aoTocar={setVeiculoId} />
              )}
            </View>
          )}

          <View style={estilos.grupo}>
            <Text style={estilos.rotulo}>O que está acontecendo?</Text>
            <Escolha opcoes={TIPOS_OCORRENCIA} escolhidos={tipo ? [tipo] : []} aoTocar={setTipo} />
          </View>

          <View style={estilos.grupo}>
            <Text style={estilos.rotulo}>Urgência</Text>
            <View style={estilos.urgencias}>
              {URGENCIAS.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => setUrgencia(u.id)}
                  style={[estilos.urgencia, urgencia === u.id && estilos.opcaoEscolhida]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: urgencia === u.id }}
                >
                  <Text style={[estilos.opcaoTexto, urgencia === u.id && estilos.opcaoTextoEscolhida]}>{u.nome}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Campo
            rotulo="Conte o que aconteceu"
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Quando começou, o que você percebeu, em que situação acontece..."
            linhas={4}
            maxLength={1000}
          />

          <MensagemErro>{erro || erroCarga}</MensagemErro>
          <Botao titulo="Abrir chamado" onPress={enviar} ocupado={enviando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const estilos = comTema(() => StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 22 },
  grupo: { gap: 10 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco },
  opcaoEscolhida: { backgroundColor: cores.marca700 },
  opcaoTexto: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.texto },
  opcaoTextoEscolhida: { color: cores.branco },
  urgencias: { flexDirection: 'row', gap: 8 },
  urgencia: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: cores.fundo },
}))
