import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { resolverChamado } from '@/servicos/chamados'
import { nomeTipoOcorrencia } from '@/dados/chamados'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import MensagemErro from '@/componentes/MensagemErro'
import { comTema, cores, fontes } from '@/tema'

// Concluir o chamado contando o que foi feito (obrigatório: fica no histórico do caminhão), igual ao web.
export default function ResolverChamado() {
  const { id, placa, tipo, descricao } = useLocalSearchParams<{ id: string; placa: string; tipo: string; descricao: string }>()
  const { chamar } = useSessao()
  const [solucao, setSolucao] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function resolver() {
    if (!solucao.trim()) {
      setErro('Conte o que foi feito.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      await resolverChamado(chamar, Number(id), solucao)
      router.back()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível resolver o chamado.')
      setSalvando(false)
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoDoModal titulo="Resolver chamado" placa={placa} />

          <View style={estilos.problema}>
            <Text style={estilos.tipo}>{nomeTipoOcorrencia(tipo)}</Text>
            <Text style={estilos.descricao}>{descricao}</Text>
          </View>

          <Campo
            rotulo="O que foi feito?"
            value={solucao}
            onChangeText={setSolucao}
            placeholder="Ex.: trocada a lona de freio traseira e regulado o tambor"
            linhas={4}
            maxLength={1000}
          />

          <MensagemErro>{erro}</MensagemErro>
          <Botao titulo="Marcar como resolvido" icone="check" onPress={resolver} ocupado={salvando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const estilos = comTema(() => StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 22 },
  problema: { backgroundColor: cores.fundo, borderRadius: 16, padding: 16, gap: 4 },
  tipo: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  descricao: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.textoMedio },
}))
