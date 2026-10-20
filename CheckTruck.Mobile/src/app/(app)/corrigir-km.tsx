import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { corrigirKm } from '@/servicos/caminhoes'
import { formatKm } from '@/dados/formato'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

// Só Admin e Gestor: corrige um km digitado errado (ex.: um zero a mais), igual ao web.
// Pode baixar o km, mas não para menos que o km da maior OS do caminhão (minimo).
export default function CorrigirKm() {
  const { id, placa, km, minimo: minimoDaOs } = useLocalSearchParams<{ id: string; placa: string; km: string; minimo: string }>()
  const { chamar } = useSessao()
  const kmAtual = Number(km)
  const minimo = Number(minimoDaOs || 0)
  const [digitado, setDigitado] = useState(km ?? '')
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    const valor = Number(digitado)
    if (digitado === '' || !Number.isInteger(valor) || valor < 0) { setErro('Informe o km certo (sem negativo).'); return }
    if (valor === kmAtual) { setErro('O caminhão já está com esse km.'); return }
    if (valor < minimo) { setErro(`A maior OS deste caminhão é de ${formatKm(minimo)}. Use um km a partir desse ou corrija a OS antes.`); return }
    if (!motivo.trim()) { setErro('Informe o motivo da correção (ex.: zero a mais).'); return }

    setSalvando(true)
    setErro('')
    try {
      await corrigirKm(chamar, Number(id), valor, motivo)
      router.back()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível corrigir o km.')
      setSalvando(false)
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoDoModal titulo="Corrigir km" placa={placa} />

          <View style={estilos.registrado}>
            <Text style={estilos.rotulo}>Hoje com</Text>
            <Text style={estilos.km}>{formatKm(kmAtual)}</Text>
          </View>
          <View style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>
              Para km digitado errado (ex.: um zero a mais). A correção fica no histórico de km com o seu nome e o motivo.
            </Text>
          </View>

          <Campo
            rotulo="Km certo"
            value={digitado}
            onChangeText={(texto) => setDigitado(texto.replace(/\D/g, ''))}
            keyboardType="number-pad"
            dica={minimo > 0 ? `Mínimo ${formatKm(minimo)} (maior OS deste caminhão)` : undefined}
          />
          <Campo
            rotulo="Motivo"
            value={motivo}
            onChangeText={setMotivo}
            placeholder="Ex.: zero a mais no Atualizar km"
            maxLength={200}
          />

          <MensagemErro>{erro}</MensagemErro>
          <Botao titulo="Salvar correção" onPress={salvar} ocupado={salvando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 20 },
  registrado: { backgroundColor: cores.fundo, borderRadius: 16, padding: 16, gap: 2 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  km: { fontFamily: fontes.titulo, fontSize: 30, color: cores.texto },
  aviso: { backgroundColor: cores.marca50, borderRadius: 12, padding: 12 },
  avisoTexto: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 19, color: cores.marca700 },
})
