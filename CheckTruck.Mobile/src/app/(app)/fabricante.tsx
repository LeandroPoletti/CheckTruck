import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { buscarFabricante, cadastrarPais, excluirFabricante, paises as listarPaises, salvarFabricante, type Pais } from '@/servicos/cadastros'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import ConfirmarExclusao from '@/componentes/ConfirmarExclusao'
import Escolha from '@/componentes/Escolha'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

type Erros = { nome?: string; pais?: string }

const porNome = (a: Pais, b: Pais) => a.nome.localeCompare(b.nome)

// Novo fabricante (sem id) ou editar um da empresa, igual à janela do web. O país de origem se escolhe na lista e,
// se faltar, se cadastra ali mesmo. Excluir volta para o Catálogo (a API recusa fabricante com geração).
export default function JanelaDoFabricante() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const editando = !!id
  const { chamar } = useSessao()
  const [paises, setPaises] = useState<Pais[] | null>(null)
  const [nome, setNome] = useState('')
  const [paisId, setPaisId] = useState<number | null>(null)
  const [nomeSalvo, setNomeSalvo] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const [lista, fabricante] = await Promise.all([
          listarPaises(chamar),
          id ? buscarFabricante(chamar, Number(id)) : Promise.resolve(null),
        ])
        if (fabricante) {
          setNome(fabricante.nome)
          setNomeSalvo(fabricante.nome)
          setPaisId(fabricante.paisOrigem?.id ?? null)
        }
        setPaises([...lista].sort(porNome))
      } catch (e) {
        setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar.')
      }
    }
    carregar()
  }, [chamar, id])

  async function salvar() {
    const e: Erros = {}
    if (!nome.trim()) e.nome = 'Informe o nome do fabricante.'
    if (!paisId) e.pais = 'Selecione o país de origem.'
    setErros(e)
    setErroApi('')
    if (e.nome || !paisId) return

    setSalvando(true)
    try {
      await salvarFabricante(chamar, nome, paisId, editando ? Number(id) : undefined)
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
      await excluirFabricante(chamar, Number(id))
      router.dismissTo('/catalogo')
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
          <CabecalhoDoModal titulo={editando ? 'Editar fabricante' : 'Novo fabricante'} />
          {!paises && !erroApi && <ActivityIndicator color={cores.marca700} />}

          {paises && (
            <>
              <Campo
                rotulo="Nome"
                value={nome}
                onChangeText={(t) => { setNome(t); setErros((e) => ({ ...e, nome: undefined })) }}
                placeholder="Volvo"
                maxLength={100}
                erro={erros.nome}
              />
              <View style={estilos.grupo}>
                <Text style={estilos.rotulo}>País de origem</Text>
                <Escolha
                  opcoes={paises}
                  escolhidos={paisId ? [paisId] : []}
                  aoTocar={(p) => { setPaisId(p); setErros((e) => ({ ...e, pais: undefined })) }}
                />
                {!!erros.pais && <Text style={estilos.erro}>{erros.pais}</Text>}
                <NovoPais
                  aoCadastrar={(p) => {
                    setPaises((lista) => [...(lista ?? []), p].sort(porNome))
                    setPaisId(p.id)
                    setErros((e) => ({ ...e, pais: undefined }))
                  }}
                />
              </View>
            </>
          )}

          <MensagemErro>{erroApi}</MensagemErro>
          {paises && !confirmando && <Botao titulo="Salvar" onPress={salvar} ocupado={salvando} />}
          {paises && editando && !confirmando && (
            <Botao titulo="Excluir" tipo="discreto" icone="trash-2" onPress={() => setConfirmando(true)} />
          )}
          {confirmando && (
            <ConfirmarExclusao
              titulo="Excluir fabricante"
              texto={`Excluir "${nomeSalvo}"? Não é possível excluir um fabricante que tenha gerações.`}
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

// O país que falta, cadastrado ali mesmo (permissão Cadastros). Já entra escolhido.
function NovoPais({ aoCadastrar }: { aoCadastrar(pais: Pais): void }) {
  const { chamar } = useSessao()
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  if (!aberto) return <Botao titulo="Cadastrar país" tipo="discreto" icone="plus" onPress={() => setAberto(true)} />

  async function salvar() {
    if (!nome.trim()) { setErro('Informe o nome do país.'); return }
    setSalvando(true)
    setErro('')
    try {
      aoCadastrar(await cadastrarPais(chamar, nome))
      setAberto(false)
      setNome('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível cadastrar.')
    }
    setSalvando(false)
  }

  return (
    <View style={estilos.cadastro}>
      <Campo rotulo="Nome do país" value={nome} onChangeText={setNome} placeholder="Suécia" maxLength={100} />
      <MensagemErro>{erro}</MensagemErro>
      <View style={estilos.linha}>
        <View style={estilos.metade}>
          <Botao titulo="Cancelar" tipo="discreto" onPress={() => { setAberto(false); setErro('') }} />
        </View>
        <View style={estilos.metade}>
          <Botao titulo="Cadastrar" onPress={salvar} ocupado={salvando} />
        </View>
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 20 },
  grupo: { gap: 10 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  erro: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.erroTexto },
  cadastro: { borderWidth: 1, borderColor: cores.borda, borderRadius: 16, padding: 14, gap: 12 },
  linha: { flexDirection: 'row', gap: 12 },
  metade: { flex: 1 },
})
