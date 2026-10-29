import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { atualizarKm } from '@/servicos/caminhoes'
import { formatKm } from '@/dados/formato'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import MensagemErro from '@/componentes/MensagemErro'
import { comTema, cores, fontes } from '@/tema'

// Quem está com o caminhão (ou tem Atualizar km) digita o km do painel. O km só sobe; se o registrado está errado,
// quem corrige é o gestor no web.
export default function AtualizarKm() {
  const { id, placa, km } = useLocalSearchParams<{ id: string; placa: string; km: string }>()
  const { chamar, usuario } = useSessao()
  const kmAtual = Number(km)
  const [digitado, setDigitado] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const kmNovo = Number(digitado)
  const rodou = digitado !== '' && kmNovo > kmAtual ? kmNovo - kmAtual : null

  async function salvar() {
    if (digitado === '' || kmNovo <= kmAtual) {
      const quemCorrige = usuario?.cuidaDosAcessos ? 'use Corrigir km no caminhão' : 'peça ao gestor para corrigir'
      setErro(`Informe um km maior que o atual (${formatKm(kmAtual)}). Se o atual está errado, ${quemCorrige}.`)
      return
    }
    setSalvando(true)
    setErro('')
    try {
      await atualizarKm(chamar, Number(id), kmNovo, usuario?.cargo === 'Motorista')
      router.back()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar o km.')
      setSalvando(false)
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoDoModal titulo="Atualizar km" placa={placa} />

          <View style={estilos.registrado}>
            <Text style={estilos.rotulo}>Último km registrado</Text>
            <Text style={estilos.km}>{formatKm(kmAtual)}</Text>
          </View>

          <Campo
            rotulo="Km do painel agora"
            value={digitado}
            onChangeText={(texto) => setDigitado(texto.replace(/\D/g, ''))}
            placeholder="Só os números, ex.: 125400"
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={salvar}
            autoFocus
          />
          {rodou !== null && <Text style={estilos.rodou}>Rodou {formatKm(rodou)} desde o último registro.</Text>}

          <MensagemErro>{erro}</MensagemErro>
          <Botao titulo="Salvar km" onPress={salvar} ocupado={salvando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const estilos = comTema(() => StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 20 },
  registrado: { backgroundColor: cores.fundo, borderRadius: 16, padding: 16, gap: 2 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  km: { fontFamily: fontes.titulo, fontSize: 30, color: cores.texto },
  rodou: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.marca700, marginTop: -8 },
}))
