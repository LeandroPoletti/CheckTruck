import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { buscarModelo, excluirModelo, fabricantes as listarFabricantes, salvarModelo, type Fabricante } from '@/servicos/cadastros'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import ConfirmarExclusao from '@/componentes/ConfirmarExclusao'
import Escolha from '@/componentes/Escolha'
import MensagemErro from '@/componentes/MensagemErro'
import { comTema, cores, fontes } from '@/tema'

type Erros = { fabricante?: string; nome?: string }

// Novo modelo (sem id, já com o fabricante de onde veio) ou editar um da empresa, igual à janela do web.
// O modelo é a linha do fabricante (FH, FM, R, Actros...). Excluir volta para os modelos do fabricante
// (a API recusa modelo com geração).
export default function JanelaDoModelo() {
  const { id, fabricante: doFabricante } = useLocalSearchParams<{ id?: string; fabricante?: string }>()
  const editando = !!id
  const { chamar } = useSessao()
  const [fabricantes, setFabricantes] = useState<Fabricante[] | null>(null)
  const [fabricanteId, setFabricanteId] = useState<number | null>(doFabricante ? Number(doFabricante) : null)
  const [nome, setNome] = useState('')
  // Como está salvo: o nome completo (para a confirmação) e o fabricante (para onde voltar depois de excluir)
  const [nomeSalvo, setNomeSalvo] = useState('')
  const [fabricanteSalvo, setFabricanteSalvo] = useState(0)
  const [erros, setErros] = useState<Erros>({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const [lista, modelo] = await Promise.all([
          listarFabricantes(chamar),
          id ? buscarModelo(chamar, Number(id)) : Promise.resolve(null),
        ])
        if (modelo) {
          setNome(modelo.nome)
          setNomeSalvo(`${modelo.fabricante?.nome ?? ''} ${modelo.nome}`.trim())
          setFabricanteId(modelo.fabricante?.id ?? null)
          setFabricanteSalvo(modelo.fabricante?.id ?? 0)
        }
        setFabricantes([...lista].sort((a, b) => a.nome.localeCompare(b.nome)))
      } catch (e) {
        setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar.')
      }
    }
    carregar()
  }, [chamar, id])

  async function salvar() {
    const e: Erros = {}
    if (!fabricanteId) e.fabricante = 'Selecione o fabricante.'
    if (!nome.trim()) e.nome = 'Informe o nome do modelo.'
    setErros(e)
    setErroApi('')
    if (!fabricanteId || e.nome) return

    setSalvando(true)
    try {
      await salvarModelo(chamar, nome, fabricanteId, editando ? Number(id) : undefined)
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
      await excluirModelo(chamar, Number(id))
      router.dismissTo({ pathname: '/modelos', params: { fabricante: fabricanteSalvo } })
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
          <CabecalhoDoModal titulo={editando ? 'Editar modelo' : 'Novo modelo'} />
          {!fabricantes && !erroApi && <ActivityIndicator color={cores.marca700} />}

          {fabricantes && (
            <>
              <View style={estilos.grupo}>
                <Text style={estilos.rotulo}>Fabricante</Text>
                <Escolha
                  opcoes={fabricantes}
                  escolhidos={fabricanteId ? [fabricanteId] : []}
                  aoTocar={(f) => { setFabricanteId(f); setErros((e) => ({ ...e, fabricante: undefined })) }}
                />
                {!!erros.fabricante && <Text style={estilos.erro}>{erros.fabricante}</Text>}
              </View>
              <Campo
                rotulo="Nome"
                value={nome}
                onChangeText={(t) => { setNome(t); setErros((e) => ({ ...e, nome: undefined })) }}
                placeholder="FH"
                maxLength={100}
                dica="Ex.: FH, FM, VM, R, Actros, Stralis"
                erro={erros.nome}
              />
            </>
          )}

          <MensagemErro>{erroApi}</MensagemErro>
          {fabricantes && !confirmando && <Botao titulo="Salvar" onPress={salvar} ocupado={salvando} />}
          {fabricantes && editando && !confirmando && (
            <Botao titulo="Excluir" tipo="discreto" icone="trash-2" onPress={() => setConfirmando(true)} />
          )}
          {confirmando && (
            <ConfirmarExclusao
              titulo="Excluir modelo"
              texto={`Excluir "${nomeSalvo}"? Não é possível excluir um modelo que tenha gerações.`}
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

const estilos = comTema(() => StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 20 },
  grupo: { gap: 10 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  erro: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.erroTexto },
}))
