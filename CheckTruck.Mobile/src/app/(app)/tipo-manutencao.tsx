import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { excluirTipo, salvarTipo, tipoDeManutencao } from '@/servicos/cadastros'
import { COMPONENTES } from '@/dados/intervalos'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import ConfirmarExclusao from '@/componentes/ConfirmarExclusao'
import Escolha from '@/componentes/Escolha'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

const OPCOES = Object.entries(COMPONENTES).map(([id, nome]) => ({ id: Number(id), nome }))

// Cadastrar (sem id) ou editar um item que o sistema acompanha nos caminhões, igual à janela do web.
// Editando: Excluir (a API recusa se o item já tem OS lançada ou intervalo cadastrado).
export default function JanelaDoTipo() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const editando = !!id
  const { chamar } = useSessao()
  const [carregado, setCarregado] = useState(!editando)
  const [nome, setNome] = useState('')
  const [componente, setComponente] = useState(OPCOES[0].id)
  const [descricao, setDescricao] = useState('')
  const [nomeSalvo, setNomeSalvo] = useState('')
  const [erroNome, setErroNome] = useState('')
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    if (!id) return
    tipoDeManutencao(chamar, Number(id))
      .then((t) => {
        setNome(t.nome)
        setComponente(t.componente)
        setDescricao(t.descricao)
        setNomeSalvo(t.nome)
        setCarregado(true)
      })
      .catch((e) => setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar.'))
  }, [chamar, id])

  async function salvar() {
    setErroApi('')
    if (!nome.trim()) { setErroNome('Informe o nome.'); return }
    setSalvando(true)
    try {
      await salvarTipo(chamar, { nome, componente, descricao }, editando ? Number(id) : undefined)
      router.back()
    } catch (err) {
      setErroApi(err instanceof Error ? err.message : 'Não foi possível salvar.')
      setSalvando(false)
    }
  }

  async function excluir() {
    setExcluindo(true)
    setErroApi('')
    try {
      await excluirTipo(chamar, Number(id))
      router.back()
    } catch (err) {
      setErroApi(err instanceof Error ? err.message : 'Não foi possível excluir.')
      setExcluindo(false)
      setConfirmando(false)
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoDoModal titulo={editando ? 'Editar tipo de manutenção' : 'Novo tipo de manutenção'} />
          {!carregado && !erroApi && <ActivityIndicator color={cores.marca700} />}

          {carregado && (
            <>
              <Campo
                rotulo="Nome"
                value={nome}
                onChangeText={(t) => { setNome(t); setErroNome('') }}
                placeholder="Óleo do diferencial 2"
                maxLength={100}
                erro={erroNome}
              />
              <View style={estilos.grupo}>
                <Text style={estilos.rotulo}>Componente</Text>
                <Escolha opcoes={OPCOES} escolhidos={[componente]} aoTocar={setComponente} />
                <Text style={estilos.dica}>
                  Sem intervalo cadastrado, vale o padrão seguro do componente. Embreagem não tem padrão: precisa de intervalo.
                </Text>
              </View>
              <Campo
                rotulo="Descrição"
                value={descricao}
                onChangeText={setDescricao}
                placeholder="O que é trocado"
                maxLength={500}
              />
            </>
          )}

          <MensagemErro>{erroApi}</MensagemErro>
          {carregado && !confirmando && <Botao titulo="Salvar" onPress={salvar} ocupado={salvando} />}
          {carregado && editando && !confirmando && (
            <Botao titulo="Excluir" tipo="discreto" icone="trash-2" onPress={() => setConfirmando(true)} />
          )}
          {confirmando && (
            <ConfirmarExclusao
              titulo="Excluir tipo de manutenção"
              texto={`Excluir "${nomeSalvo}"? Não dá para excluir um item que já tenha OS lançada ou intervalo cadastrado.`}
              excluindo={excluindo}
              aoExcluir={excluir}
              aoCancelar={() => setConfirmando(false)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 20 },
  grupo: { gap: 10 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  dica: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.textoFraco },
})
