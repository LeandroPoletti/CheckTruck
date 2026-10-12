import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { excluirMecanico, mecanico, salvarMecanico } from '@/servicos/cadastros'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import Chave from '@/componentes/Chave'
import ConfirmarExclusao from '@/componentes/ConfirmarExclusao'
import MensagemErro from '@/componentes/MensagemErro'
import { cores } from '@/tema'

type Erros = { nome?: string; funcao?: string }

// Cadastrar (sem id) ou editar um mecânico, igual à janela do web: nome e função (ex.: Marco Rueda / Borracheiro),
// sem login. No Autônomo é a oficina ou o mecânico onde ele faz as trocas (ex.: Oficina do Zé / Oficina).
// Editando: Ativo (o inativo sai da lista da OS) e Excluir (a API recusa se ele já tem OS).
export default function JanelaDoMecanico() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const editando = !!id
  const { chamar, usuario } = useSessao()
  const autonomo = usuario?.tipoConta === 'Autonomo'
  const [carregado, setCarregado] = useState(!editando)
  const [nome, setNome] = useState('')
  const [funcao, setFuncao] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [nomeSalvo, setNomeSalvo] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    if (!id) return
    mecanico(chamar, Number(id))
      .then((m) => {
        setNome(m.nome)
        setFuncao(m.funcao)
        setAtivo(m.ativo)
        setNomeSalvo(m.nome)
        setCarregado(true)
      })
      .catch((e) => setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar.'))
  }, [chamar, id])

  async function salvar() {
    const e: Erros = {}
    if (!nome.trim()) e.nome = autonomo ? 'Informe o nome.' : 'Informe o nome do mecânico.'
    if (!funcao.trim()) {
      e.funcao = autonomo ? 'Informe a função (ex.: oficina, mecânico, borracheiro).' : 'Informe a função (ex.: mecânico, borracheiro).'
    }
    setErros(e)
    setErroApi('')
    if (e.nome || e.funcao) return

    setSalvando(true)
    try {
      await salvarMecanico(chamar, { nome, funcao, ativo }, editando ? Number(id) : undefined)
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
      await excluirMecanico(chamar, Number(id))
      router.back()
    } catch (err) {
      setErroApi(err instanceof Error ? err.message : 'Não foi possível excluir.')
      setExcluindo(false)
      setConfirmando(false)
    }
  }

  const titulo = autonomo
    ? (editando ? 'Editar oficina ou mecânico' : 'Oficina ou mecânico')
    : (editando ? 'Editar mecânico' : 'Novo mecânico')

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoDoModal titulo={titulo} />
          {!carregado && !erroApi && <ActivityIndicator color={cores.marca700} />}

          {carregado && (
            <>
              <Campo
                rotulo="Nome"
                value={nome}
                onChangeText={(t) => { setNome(t); setErros((e) => ({ ...e, nome: undefined })) }}
                placeholder={autonomo ? 'Oficina do Zé' : 'Marco Rueda'}
                maxLength={150}
                erro={erros.nome}
              />
              <Campo
                rotulo="Função"
                value={funcao}
                onChangeText={(t) => { setFuncao(t); setErros((e) => ({ ...e, funcao: undefined })) }}
                placeholder={autonomo ? 'Oficina' : 'Borracheiro'}
                maxLength={100}
                erro={erros.funcao}
              />
              {editando && (
                <Chave
                  titulo={ativo ? 'Ativo — aparece na lista da OS' : 'Inativo — não aparece na lista da OS'}
                  valor={ativo}
                  aoMudar={setAtivo}
                />
              )}
            </>
          )}

          <MensagemErro>{erroApi}</MensagemErro>
          {carregado && !confirmando && <Botao titulo="Salvar" onPress={salvar} ocupado={salvando} />}
          {carregado && editando && !confirmando && (
            <Botao titulo="Excluir" tipo="discreto" icone="trash-2" onPress={() => setConfirmando(true)} />
          )}
          {confirmando && (
            <ConfirmarExclusao
              titulo="Excluir mecânico"
              texto={`Excluir "${nomeSalvo}"? Se ele já tiver OS lançadas, desative o cadastro em vez de excluir.`}
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
})
