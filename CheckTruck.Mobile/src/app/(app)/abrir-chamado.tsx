import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { abrirChamado, type Chamado } from '@/servicos/motorista'
import { TIPOS_OCORRENCIA, URGENCIAS } from '@/dados/chamados'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

// O motorista conta um problema do caminhão dele, e quem atende chamados vê no web e no app.
export default function AbrirChamado() {
  const { id, placa } = useLocalSearchParams<{ id: string; placa: string }>()
  const { chamar } = useSessao()
  const [tipo, setTipo] = useState<string | null>(null)
  const [urgencia, setUrgencia] = useState<Chamado['urgencia']>('Media')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar() {
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
      await abrirChamado(chamar, { veiculoId: Number(id), tipo, urgencia, descricao })
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

          <View style={estilos.grupo}>
            <Text style={estilos.rotulo}>O que está acontecendo?</Text>
            <View style={estilos.opcoes}>
              {TIPOS_OCORRENCIA.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setTipo(t.id)}
                  style={[estilos.opcao, tipo === t.id && estilos.opcaoEscolhida]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: tipo === t.id }}
                >
                  <Text style={[estilos.opcaoTexto, tipo === t.id && estilos.opcaoTextoEscolhida]}>{t.nome}</Text>
                </Pressable>
              ))}
            </View>
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

          <MensagemErro>{erro}</MensagemErro>
          <Botao titulo="Abrir chamado" onPress={enviar} ocupado={enviando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 22 },
  grupo: { gap: 10 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: cores.fundo },
  opcaoEscolhida: { backgroundColor: cores.marca700 },
  opcaoTexto: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.texto },
  opcaoTextoEscolhida: { color: cores.branco },
  urgencias: { flexDirection: 'row', gap: 8 },
  urgencia: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: cores.fundo },
})
