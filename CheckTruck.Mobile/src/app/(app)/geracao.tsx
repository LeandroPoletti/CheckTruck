import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSessao } from '@/servicos/sessao'
import { buscarGeracao, buscarModelo, excluirGeracao, salvarGeracao } from '@/servicos/cadastros'
import { ANO_MINIMO, NORMAS, anoMaximo, anoValido } from '@/dados/caminhoes'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import ConfirmarExclusao from '@/componentes/ConfirmarExclusao'
import Escolha from '@/componentes/Escolha'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

const CV_MIN = 100
const CV_MAX = 1000
const OPCOES_NORMA = Object.entries(NORMAS).map(([id, nome]) => ({ id, nome }))

type Form = { nome: string; anoInicio: string; anoFim: string; norma: string; motor: string; caixa: string }
type Erros = Partial<Record<keyof Form | 'potencias', string>>

const soNumeros = (texto: string) => texto.replace(/\D/g, '')

// Nova geração (sem id, no modelo de onde veio) ou editar uma da empresa, igual à janela do web: a época do modelo
// no Brasil (anos, norma, motor, câmbio) e as potências em que foi vendida. O modelo não muda aqui.
// Excluir: a API recusa geração com caminhão ou intervalo, e potência com caminhão não sai da lista.
export default function JanelaDaGeracao() {
  const { id, modelo: doModelo } = useLocalSearchParams<{ id?: string; modelo?: string }>()
  const editando = !!id
  const { chamar } = useSessao()
  const [modelo, setModelo] = useState<{ id: number; nome: string } | null>(null)
  const [form, setForm] = useState<Form>({ nome: '', anoInicio: '', anoFim: '', norma: '', motor: '', caixa: '' })
  const [potencias, setPotencias] = useState<number[]>([])
  const [novaCv, setNovaCv] = useState('')
  const [nomeSalvo, setNomeSalvo] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  // O modelo (para mostrar "Volvo FH") e, editando, a geração como está salva
  useEffect(() => {
    async function carregar() {
      try {
        if (id) {
          const g = await buscarGeracao(chamar, Number(id))
          const nomeDoModelo = `${g.fabricante?.nome ?? ''} ${g.modelo?.nome ?? ''}`.trim()
          setForm({
            nome: g.nome,
            anoInicio: String(g.anoInicio),
            anoFim: g.anoFim === null ? '' : String(g.anoFim),
            norma: g.normaEmissao,
            motor: g.motor ?? '',
            caixa: g.caixa ?? '',
          })
          setPotencias(g.potencias.map((p) => p.cv))
          setNomeSalvo(`${nomeDoModelo} · ${g.nome}`)
          setModelo({ id: g.modelo?.id ?? 0, nome: nomeDoModelo })
        } else {
          const m = await buscarModelo(chamar, Number(doModelo))
          setModelo({ id: m.id, nome: `${m.fabricante?.nome ?? ''} ${m.nome}`.trim() })
        }
      } catch (e) {
        setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar.')
      }
    }
    carregar()
  }, [chamar, id, doModelo])

  function mudar(campo: keyof Form, valor: string) {
    setErros((e) => ({ ...e, [campo]: undefined }))
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function adicionarPotencia() {
    const cv = Number(novaCv)
    if (!cv || cv < CV_MIN || cv > CV_MAX) { setErros((e) => ({ ...e, potencias: `A potência vai de ${CV_MIN} a ${CV_MAX} cv.` })); return }
    if (potencias.includes(cv)) { setErros((e) => ({ ...e, potencias: `${cv} cv já está na lista.` })); return }
    setPotencias((lista) => [...lista, cv].sort((a, b) => a - b))
    setNovaCv('')
    setErros((e) => ({ ...e, potencias: undefined }))
  }

  async function salvar() {
    const max = anoMaximo()
    const anoInicio = Number(form.anoInicio)
    const anoFim = form.anoFim === '' ? null : Number(form.anoFim)
    const e: Erros = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome da geração.'
    if (!anoValido(anoInicio)) e.anoInicio = `O primeiro ano-modelo vai de ${ANO_MINIMO} a ${max}.`
    if (anoFim !== null && (!anoValido(anoFim) || anoFim < anoInicio)) e.anoFim = `O último ano-modelo vai do primeiro até ${max}.`
    if (!form.norma) e.norma = 'Escolha a norma de emissão.'
    if (potencias.length === 0) e.potencias = 'Informe pelo menos uma potência.'
    setErros(e)
    setErroApi('')
    if (Object.keys(e).length || !modelo) return

    setSalvando(true)
    try {
      await salvarGeracao(chamar, {
        nome: form.nome,
        modeloId: modelo.id,
        anoInicio,
        anoFim,
        normaEmissao: form.norma,
        motor: form.motor,
        caixa: form.caixa,
        potencias,
      }, editando ? Number(id) : undefined)
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
      await excluirGeracao(chamar, Number(id))
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
          <CabecalhoDoModal titulo={editando ? 'Editar geração' : 'Nova geração'} />
          {!modelo && !erroApi && <ActivityIndicator color={cores.marca700} />}

          {modelo && (
            <>
              <View style={estilos.modelo}>
                <Text style={estilos.rotulo}>Modelo</Text>
                <Text style={estilos.modeloNome}>{modelo.nome}</Text>
              </View>
              <Campo
                rotulo="Nome"
                value={form.nome}
                onChangeText={(t) => mudar('nome', t)}
                placeholder="Novo FH (FH 4)"
                maxLength={100}
                erro={erros.nome}
              />
              <View style={estilos.linha}>
                <View style={estilos.metade}>
                  <Campo
                    rotulo="Primeiro ano-modelo"
                    value={form.anoInicio}
                    onChangeText={(t) => mudar('anoInicio', soNumeros(t))}
                    placeholder="2015"
                    keyboardType="number-pad"
                    maxLength={4}
                    erro={erros.anoInicio}
                  />
                </View>
                <View style={estilos.metade}>
                  <Campo
                    rotulo="Último ano-modelo"
                    value={form.anoFim}
                    onChangeText={(t) => mudar('anoFim', soNumeros(t))}
                    placeholder="2021"
                    keyboardType="number-pad"
                    maxLength={4}
                    dica="Vazio = ainda é vendida"
                    erro={erros.anoFim}
                  />
                </View>
              </View>
              <View style={estilos.grupo}>
                <Text style={estilos.rotulo}>Norma de emissão</Text>
                <Escolha opcoes={OPCOES_NORMA} escolhidos={[form.norma]} aoTocar={(n) => mudar('norma', n)} />
                <Text style={erros.norma ? estilos.erro : estilos.dica}>
                  {erros.norma ?? 'Muda o padrão do sistema para o óleo do motor.'}
                </Text>
              </View>
              <View style={estilos.linha}>
                <View style={estilos.metade}>
                  <Campo rotulo="Motor" value={form.motor} onChangeText={(t) => mudar('motor', t)} placeholder="D13C" maxLength={100} />
                </View>
                <View style={estilos.metade}>
                  <Campo rotulo="Câmbio" value={form.caixa} onChangeText={(t) => mudar('caixa', t)} placeholder="I-Shift" maxLength={100} />
                </View>
              </View>

              <View style={estilos.grupo}>
                <View style={estilos.linhaDaPotencia}>
                  <View style={estilos.metade}>
                    <Campo
                      rotulo="Potências (cv)"
                      value={novaCv}
                      onChangeText={(t) => { setNovaCv(soNumeros(t)); setErros((e) => ({ ...e, potencias: undefined })) }}
                      placeholder="460"
                      keyboardType="number-pad"
                      maxLength={4}
                      onSubmitEditing={adicionarPotencia}
                    />
                  </View>
                  <View style={estilos.metade}>
                    <Botao titulo="Adicionar" tipo="discreto" icone="plus" onPress={adicionarPotencia} />
                  </View>
                </View>
                {potencias.length > 0 && (
                  <View style={estilos.potencias}>
                    {potencias.map((cv) => (
                      <Pressable
                        key={cv}
                        onPress={() => setPotencias((lista) => lista.filter((c) => c !== cv))}
                        accessibilityRole="button"
                        accessibilityLabel={`Tirar ${cv} cv`}
                        hitSlop={6}
                        style={estilos.potencia}
                      >
                        <Text style={estilos.potenciaTexto}>{cv} cv</Text>
                        <Feather name="x" size={14} color={cores.marca700} />
                      </Pressable>
                    ))}
                  </View>
                )}
                <Text style={erros.potencias ? estilos.erro : estilos.dica}>
                  {erros.potencias ?? 'Toque numa potência para tirar. Potência com caminhão cadastrado não pode sair da lista.'}
                </Text>
              </View>
            </>
          )}

          <MensagemErro>{erroApi}</MensagemErro>
          {modelo && !confirmando && <Botao titulo="Salvar" onPress={salvar} ocupado={salvando} />}
          {modelo && editando && !confirmando && (
            <Botao titulo="Excluir" tipo="discreto" icone="trash-2" onPress={() => setConfirmando(true)} />
          )}
          {confirmando && (
            <ConfirmarExclusao
              titulo="Excluir geração"
              texto={`Excluir "${nomeSalvo}" e as potências dela? Não é possível excluir uma geração com caminhão ou intervalo cadastrado.`}
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
  modelo: { backgroundColor: cores.fundo, borderRadius: 16, padding: 16, gap: 2 },
  modeloNome: { fontFamily: fontes.titulo, fontSize: 24, color: cores.texto },
  grupo: { gap: 10 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  dica: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.textoFraco },
  erro: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.erroTexto },
  linha: { flexDirection: 'row', gap: 12 },
  linhaDaPotencia: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  metade: { flex: 1 },
  potencias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  potencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: cores.marca100,
  },
  potenciaTexto: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.marca700 },
})
