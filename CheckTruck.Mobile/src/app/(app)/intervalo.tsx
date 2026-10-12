import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { tiposDeManutencao, type TipoDeManutencao } from '@/servicos/cadastros'
import { excluirIntervalo, intervalosDe, salvarIntervalo, type Alvo, type Intervalo } from '@/servicos/intervalos'
import { ORIGENS_INTERVALO, oQueVoltaAValer, textoDoIntervalo } from '@/dados/intervalos'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import ConfirmarExclusao from '@/componentes/ConfirmarExclusao'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

type Form = { intervaloKm: string; intervaloKmPrimeira: string; intervaloMeses: string; fonte: string; observacao: string }
type Erros = Partial<Record<'intervaloKm' | 'intervaloMeses', string>>

const soNumeros = (texto: string) => texto.replace(/\D/g, '')

// Define, edita ou exclui o intervalo de um item, igual à janela do web (permissão Intervalos).
// alvo "caminhao": o intervalo só deste caminhão (nome = placa). alvo "geracao": o da empresa para a geração
// (nome = "Volvo FH · FH Aero"), que também tem km da 1ª troca (amaciamento) e fonte.
// Um novo começa pelo que vale hoje.
export default function JanelaDoIntervalo() {
  const params = useLocalSearchParams<{ alvo: string; id: string; nome: string; tipoId: string }>()
  const { chamar } = useSessao()
  const daGeracao = params.alvo === 'geracao'
  const alvo: Alvo = { tipo: daGeracao ? 'geracao' : 'caminhao', id: Number(params.id) }
  const minhaOrigem = daGeracao ? 'empresa' : 'caminhao'

  const [tipo, setTipo] = useState<TipoDeManutencao | null>(null)
  const [emOrdem, setEmOrdem] = useState<Intervalo[]>([])
  const [erroCarga, setErroCarga] = useState('')
  const [form, setForm] = useState<Form>({ intervaloKm: '', intervaloKmPrimeira: '', intervaloMeses: '', fonte: '', observacao: '' })
  const [erros, setErros] = useState<Erros>({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  // O item e os intervalos dele; o formulário começa pelo meu (editar) ou pelo que vale hoje (novo)
  useEffect(() => {
    async function carregar() {
      try {
        const [tipos, tabela] = await Promise.all([
          tiposDeManutencao(chamar),
          intervalosDe(chamar, { tipo: daGeracao ? 'geracao' : 'caminhao', id: Number(params.id) }),
        ])
        const doItem = tabela.find((l) => l.tipoManutencaoId === Number(params.tipoId))?.emOrdem ?? []
        const meu = doItem.find((i) => i.origem === minhaOrigem)
        const base = meu ?? doItem[0]
        setTipo(tipos.find((t) => t.id === Number(params.tipoId)) ?? null)
        setEmOrdem(doItem)
        setForm({
          intervaloKm: base ? String(base.intervaloKm) : '',
          intervaloKmPrimeira: base?.intervaloKmPrimeira ? String(base.intervaloKmPrimeira) : '',
          intervaloMeses: base?.intervaloMeses ? String(base.intervaloMeses) : '',
          fonte: meu?.fonte ?? '',
          observacao: meu?.observacao ?? '',
        })
      } catch (e) {
        setErroCarga(e instanceof Error ? e.message : 'Não foi possível carregar o intervalo.')
      }
    }
    carregar()
  }, [chamar, daGeracao, minhaOrigem, params.id, params.tipoId])

  const vale = emOrdem[0]
  const meu = emOrdem.find((i) => i.origem === minhaOrigem)

  function mudar(campo: keyof Form, valor: string) {
    setErros((e) => ({ ...e, [campo]: undefined }))
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function salvar() {
    const km = Number(form.intervaloKm)
    const meses = Number(form.intervaloMeses || 0)
    const e: Erros = {}
    if (!km) e.intervaloKm = 'Informe o intervalo em km.'
    if (meses > 120) e.intervaloMeses = 'O prazo vai de 0 a 120 meses.'
    setErros(e)
    setErroApi('')
    if (Object.keys(e).length || !tipo) return

    setSalvando(true)
    try {
      await salvarIntervalo(chamar, alvo, tipo.id, {
        intervaloKm: km,
        intervaloKmPrimeira: Number(form.intervaloKmPrimeira || 0),
        intervaloMeses: meses,
        fonte: form.fonte,
        observacao: form.observacao,
      }, meu?.id ?? undefined)
      router.back()
    } catch (err) {
      setErroApi(err instanceof Error ? err.message : 'Não foi possível salvar o intervalo.')
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!meu?.id) return
    setExcluindo(true)
    setErroApi('')
    try {
      await excluirIntervalo(chamar, alvo, meu.id)
      router.back()
    } catch (err) {
      setErroApi(err instanceof Error ? err.message : 'Não foi possível excluir o intervalo.')
      setExcluindo(false)
    }
  }

  const titulo = meu ? 'Editar intervalo' : daGeracao ? 'Definir intervalo da empresa' : 'Definir intervalo do caminhão'

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoDoModal titulo={titulo} placa={daGeracao ? undefined : params.nome} />
          <MensagemErro>{erroCarga}</MensagemErro>
          {!tipo && !erroCarga && <ActivityIndicator color={cores.marca700} />}

          {tipo && (
            <>
              <View style={estilos.item}>
                {daGeracao && <Text style={estilos.rotulo}>{params.nome}</Text>}
                <Text style={estilos.itemNome}>{tipo.nome}</Text>
                <Text style={estilos.itemHoje}>
                  {vale ? `Hoje vale ${textoDoIntervalo(vale)} (${ORIGENS_INTERVALO[vale.origem]})` : 'Hoje não é acompanhado'}
                </Text>
              </View>
              {!meu && vale && (
                <View style={estilos.aviso}>
                  <Text style={estilos.avisoTexto}>Os valores começam pelo que vale hoje. Ajuste se o plano for diferente.</Text>
                </View>
              )}

              <Campo
                rotulo="Intervalo (km)"
                value={form.intervaloKm}
                onChangeText={(t) => mudar('intervaloKm', soNumeros(t))}
                placeholder="40000"
                keyboardType="number-pad"
                erro={erros.intervaloKm}
              />
              {daGeracao && (
                <Campo
                  rotulo="1ª troca (km)"
                  value={form.intervaloKmPrimeira}
                  onChangeText={(t) => mudar('intervaloKmPrimeira', soNumeros(t))}
                  placeholder="Amaciamento"
                  keyboardType="number-pad"
                  dica="Vazio = igual ao intervalo"
                />
              )}
              <Campo
                rotulo="Prazo (meses)"
                value={form.intervaloMeses}
                onChangeText={(t) => mudar('intervaloMeses', soNumeros(t))}
                placeholder="6"
                keyboardType="number-pad"
                maxLength={3}
                dica="Vence pelo que chegar primeiro: km ou prazo. Vazio = vence só por km."
                erro={erros.intervaloMeses}
              />
              {daGeracao && (
                <Campo
                  rotulo="Fonte"
                  value={form.fonte}
                  onChangeText={(t) => mudar('fonte', t)}
                  placeholder="Ex.: manual do fabricante"
                  maxLength={200}
                />
              )}
              <Campo
                rotulo="Observação"
                value={form.observacao}
                onChangeText={(t) => mudar('observacao', t)}
                placeholder={daGeracao ? 'Opcional' : 'Ex.: plano da concessionária'}
                maxLength={500}
              />

              <MensagemErro>{erroApi}</MensagemErro>
              {!confirmando && <Botao titulo="Salvar" onPress={salvar} ocupado={salvando} />}

              {meu && !confirmando && (
                <Botao titulo="Excluir intervalo" tipo="discreto" icone="trash-2" onPress={() => setConfirmando(true)} />
              )}
              {meu && confirmando && (
                <ConfirmarExclusao
                  titulo={daGeracao ? 'Excluir intervalo da empresa' : 'Excluir intervalo do caminhão'}
                  texto={daGeracao
                    ? `Excluir o intervalo de "${tipo.nome}" da geração ${params.nome}? Os caminhões desta geração passam a usar ${oQueVoltaAValer(emOrdem, 'empresa')}, menos os que têm intervalo do caminhão.`
                    : `Excluir o intervalo próprio de "${tipo.nome}" do caminhão ${params.nome}? Ele volta a usar ${oQueVoltaAValer(emOrdem, 'caminhao')}.`}
                  excluindo={excluindo}
                  aoExcluir={excluir}
                  aoCancelar={() => setConfirmando(false)}
                />
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 20 },
  item: { backgroundColor: cores.fundo, borderRadius: 16, padding: 16, gap: 4 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  itemNome: { fontFamily: fontes.titulo, fontSize: 24, color: cores.texto },
  itemHoje: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoMedio },
  aviso: { backgroundColor: cores.marca50, borderRadius: 12, padding: 12 },
  avisoTexto: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 19, color: cores.marca700 },
})
