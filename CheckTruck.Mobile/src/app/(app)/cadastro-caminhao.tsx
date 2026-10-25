import { useEffect, useState, type ReactNode } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { cadastroDoCaminhao, salvarCaminhao } from '@/servicos/caminhoes'
import {
  fabricantes as listarFabricantes, geracoes as listarGeracoes, modelos as listarModelos, motoristasAtivos,
  type Fabricante, type Geracao, type Modelo, type Motorista,
} from '@/servicos/cadastros'
import { ANO_MINIMO, NORMAS, TRACOES, anoMaximo, anoValido, formatarPlaca, placaValida } from '@/dados/caminhoes'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import Chave from '@/componentes/Chave'
import Escolha from '@/componentes/Escolha'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

type Listas = { fabricantes: Fabricante[]; modelos: Modelo[]; geracoes: Geracao[]; motoristas: Motorista[] }
type Form = {
  fabricanteId: number | null
  modeloId: number | null
  geracaoId: number | null
  potenciaId: number | null
  tracao: string
  placa: string
  chassi: string
  renavam: string
  anoFabricacao: string
  anoModelo: string
  kmAtual: string
  motoristaId: string
  ativo: boolean
}
type Erros = Partial<Record<keyof Form, string>>

const FORM_VAZIO: Form = {
  fabricanteId: null, modeloId: null, geracaoId: null, potenciaId: null, tracao: '',
  placa: '', chassi: '', renavam: '', anoFabricacao: '', anoModelo: '', kmAtual: '', motoristaId: '', ativo: true,
}
const porNome = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome)
const ano = (data: string) => data.slice(0, 4)

// Cadastrar ou editar um caminhão, igual ao web (permissão Veículos). O caminhão aponta para uma potência:
// fabricante → modelo → geração → potência, em cascata, e o motorista atual.
export default function CadastroCaminhao() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const editando = !!id
  const { chamar } = useSessao()

  const [listas, setListas] = useState<Listas | null>(null)
  const [erroCarga, setErroCarga] = useState('')
  const [form, setForm] = useState<Form>(FORM_VAZIO)
  const [kmOriginal, setKmOriginal] = useState(0)
  const [erros, setErros] = useState<Erros>({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Catálogo e motoristas, e o cadastro do caminhão quando é para editar
  useEffect(() => {
    async function carregar() {
      try {
        const [fabricantes, modelos, geracoes, motoristas, caminhao] = await Promise.all([
          listarFabricantes(chamar),
          listarModelos(chamar),
          listarGeracoes(chamar),
          motoristasAtivos(chamar),
          id ? cadastroDoCaminhao(chamar, Number(id)) : Promise.resolve(null),
        ])
        // O motorista do caminhão continua na lista mesmo se já estiver inativo
        const atual = caminhao?.motoristaAtual
        const comOAtual = atual && !motoristas.some((m) => m.id === atual.id) ? [...motoristas, atual] : motoristas
        setListas({
          fabricantes: [...fabricantes].sort(porNome),
          modelos: [...modelos].sort(porNome),
          geracoes: [...geracoes].sort((a, b) => a.anoInicio - b.anoInicio || a.nome.localeCompare(b.nome)),
          motoristas: comOAtual,
        })
        if (caminhao) {
          setKmOriginal(caminhao.kmAtual)
          setForm({
            fabricanteId: caminhao.fabricante?.id ?? null,
            modeloId: caminhao.modelo?.id ?? null,
            geracaoId: caminhao.geracao?.id ?? null,
            potenciaId: caminhao.potencia?.id ?? null,
            tracao: caminhao.tracao,
            placa: caminhao.placa,
            chassi: caminhao.chassi,
            renavam: caminhao.renavam ?? '',
            anoFabricacao: ano(caminhao.anoFabricacao),
            anoModelo: ano(caminhao.anoModelo),
            kmAtual: String(caminhao.kmAtual),
            motoristaId: caminhao.motoristaAtual?.id ?? '',
            ativo: caminhao.ativo,
          })
        }
      } catch (e) {
        setErroCarga(e instanceof Error ? e.message : 'Não foi possível carregar.')
      }
    }
    carregar()
  }, [chamar, id])

  // Mexer num campo tira o erro dele. Trocar um nível da cascata limpa os de baixo
  function mudar<K extends keyof Form>(campo: K, valor: Form[K]) {
    setErros((e) => ({ ...e, [campo]: undefined }))
    setForm((f) => {
      const novo = { ...f, [campo]: valor }
      if (campo === 'fabricanteId') Object.assign(novo, { modeloId: null, geracaoId: null, potenciaId: null })
      if (campo === 'modeloId') Object.assign(novo, { geracaoId: null, potenciaId: null })
      if (campo === 'geracaoId') novo.potenciaId = null
      return novo
    })
  }

  function validar() {
    const e: Erros = {}
    const max = anoMaximo()
    if (!form.potenciaId) e.potenciaId = 'Escolha a potência.'
    if (!form.tracao) e.tracao = 'Escolha a tração.'
    if (!form.placa) e.placa = 'Placa é obrigatória.'
    else if (!placaValida(form.placa)) e.placa = 'Placa inválida. Ex.: ABC-1234 ou ABC-1D23.'
    if (form.chassi.trim().length !== 17) e.chassi = `${form.chassi.trim().length} de 17 caracteres`
    if (form.renavam && form.renavam.length !== 11) e.renavam = 'O Renavam tem 11 números.'
    // Ano modelo = ano de fabricação ou o seguinte (ex.: fabricado em 2019, modelo 2019 ou 2020)
    const anoFabricacao = Number(form.anoFabricacao)
    const anoModelo = Number(form.anoModelo)
    if (!anoValido(anoFabricacao)) e.anoFabricacao = `De ${ANO_MINIMO} a ${max}`
    if (!anoValido(anoModelo)) e.anoModelo = `De ${ANO_MINIMO} a ${max}`
    else if (!e.anoFabricacao && anoModelo !== anoFabricacao && anoModelo !== anoFabricacao + 1) {
      e.anoModelo = `${anoFabricacao} ou ${anoFabricacao + 1}`
    }
    const km = Number(form.kmAtual || 0)
    if (!Number.isInteger(km) || km < 0) e.kmAtual = 'O km não pode ser negativo.'
    else if (editando && km < kmOriginal) e.kmAtual = 'O km não pode diminuir. Se foi digitado errado, use Corrigir km (Admin ou Gestor).'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function salvar() {
    setErroApi('')
    if (!validar() || form.potenciaId === null) return
    setSalvando(true)
    try {
      await salvarCaminhao(chamar, {
        potenciaId: form.potenciaId,
        tracao: form.tracao,
        placa: form.placa,
        chassi: form.chassi,
        renavam: form.renavam,
        anoFabricacao: Number(form.anoFabricacao),
        anoModelo: Number(form.anoModelo),
        kmAtual: Number(form.kmAtual || 0),
        ativo: form.ativo,
        motoristaAtualId: form.motoristaId || null,
      }, editando ? Number(id) : undefined)
      router.back()
    } catch (e) {
      setErroApi(e instanceof Error ? e.message : 'Não foi possível salvar o caminhão.')
      setSalvando(false)
    }
  }

  const modelosDoFabricante = listas?.modelos.filter((m) => m.fabricante?.id === form.fabricanteId) ?? []
  const geracoesDoModelo = listas?.geracoes.filter((g) => g.modelo?.id === form.modeloId) ?? []
  const geracao = listas?.geracoes.find((g) => g.id === form.geracaoId)

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoDoModal titulo={editando ? 'Editar caminhão' : 'Cadastrar caminhão'} placa={editando ? form.placa : undefined} />
          <MensagemErro>{erroCarga}</MensagemErro>
          {!listas && !erroCarga && <ActivityIndicator color={cores.marca700} />}

          {listas && (
            <>
              <Text style={estilos.etapa}>1 · Modelo</Text>
              <Grupo rotulo="Fabricante">
                <Escolha opcoes={listas.fabricantes} escolhidos={form.fabricanteId ? [form.fabricanteId] : []} aoTocar={(v) => mudar('fabricanteId', v)} />
              </Grupo>
              {form.fabricanteId !== null && (
                <Grupo rotulo="Modelo">
                  <Escolha opcoes={modelosDoFabricante} escolhidos={form.modeloId ? [form.modeloId] : []} aoTocar={(v) => mudar('modeloId', v)} />
                </Grupo>
              )}
              {form.modeloId !== null && (
                <Grupo rotulo="Geração">
                  <Escolha
                    opcoes={geracoesDoModelo.map((g) => ({ id: g.id, nome: `${g.nome} · ${g.anoInicio}–${g.anoFim ?? 'atual'}` }))}
                    escolhidos={form.geracaoId ? [form.geracaoId] : []}
                    aoTocar={(v) => mudar('geracaoId', v)}
                  />
                  {geracao && (
                    <Text style={estilos.dica}>
                      {[NORMAS[geracao.normaEmissao] ?? geracao.normaEmissao, geracao.motor && `Motor ${geracao.motor}`, geracao.caixa]
                        .filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </Grupo>
              )}
              {geracao && (
                <Grupo rotulo="Potência" erro={erros.potenciaId}>
                  <Escolha
                    opcoes={geracao.potencias.map((p) => ({ id: p.id, nome: `${p.cv} cv` }))}
                    escolhidos={form.potenciaId ? [form.potenciaId] : []}
                    aoTocar={(v) => mudar('potenciaId', v)}
                  />
                </Grupo>
              )}
              {!geracao && !!erros.potenciaId && <Text style={estilos.erro}>{erros.potenciaId}</Text>}
              <Grupo rotulo="Tração" erro={erros.tracao}>
                <Escolha opcoes={TRACOES} escolhidos={[form.tracao]} aoTocar={(v) => mudar('tracao', v)} />
              </Grupo>
              <Text style={estilos.dica}>
                Não achou? Cadastre o modelo e a geração no Catálogo, no fim da tela inicial (ou no site). A geração define os
                intervalos recomendados.
              </Text>

              <Text style={estilos.etapa}>2 · Identificação</Text>
              <Campo
                rotulo="Placa"
                value={form.placa}
                onChangeText={(t) => mudar('placa', formatarPlaca(t))}
                placeholder="ABC-1D23"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={8}
                erro={erros.placa}
              />
              <Campo
                rotulo="Chassi (17 caracteres)"
                value={form.chassi}
                onChangeText={(t) => mudar('chassi', t.toUpperCase())}
                placeholder="9BVR4X20DJE882301"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={17}
                erro={erros.chassi}
              />
              <Campo
                rotulo="Renavam"
                value={form.renavam}
                onChangeText={(t) => mudar('renavam', t.replace(/\D/g, '').slice(0, 11))}
                placeholder="00912345678"
                keyboardType="number-pad"
                dica="Opcional"
                erro={erros.renavam}
              />
              <View style={estilos.linha}>
                <View style={estilos.metade}>
                  <Campo
                    rotulo="Ano fabr."
                    value={form.anoFabricacao}
                    onChangeText={(t) => mudar('anoFabricacao', t.replace(/\D/g, ''))}
                    placeholder="2019"
                    keyboardType="number-pad"
                    maxLength={4}
                    erro={erros.anoFabricacao}
                  />
                </View>
                <View style={estilos.metade}>
                  <Campo
                    rotulo="Ano modelo"
                    value={form.anoModelo}
                    onChangeText={(t) => mudar('anoModelo', t.replace(/\D/g, ''))}
                    placeholder="2020"
                    keyboardType="number-pad"
                    maxLength={4}
                    dica="O de fabricação ou o seguinte"
                    erro={erros.anoModelo}
                  />
                </View>
              </View>
              <Campo
                rotulo="Km atual"
                value={form.kmAtual}
                onChangeText={(t) => mudar('kmAtual', t.replace(/\D/g, ''))}
                placeholder="Só os números, ex.: 125400"
                keyboardType="number-pad"
                erro={erros.kmAtual}
              />

              <Text style={estilos.etapa}>3 · Vínculos</Text>
              <Grupo rotulo="Motorista atual">
                <Escolha
                  opcoes={[{ id: '', nome: 'Sem motorista' }, ...listas.motoristas]}
                  escolhidos={[form.motoristaId]}
                  aoTocar={(v) => mudar('motoristaId', v)}
                />
                <Text style={estilos.dica}>Também muda quando uma OS é lançada com motorista.</Text>
              </Grupo>
              <Chave
                titulo="Ativo"
                dica="Desativado, o caminhão sai da OS e dos chamados, mas o histórico continua."
                valor={form.ativo}
                aoMudar={(v) => mudar('ativo', v)}
              />

              <MensagemErro>{erroApi}</MensagemErro>
              <Botao titulo={editando ? 'Salvar alterações' : 'Cadastrar caminhão'} onPress={salvar} ocupado={salvando} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function Grupo({ rotulo, erro, children }: { rotulo: string; erro?: string; children: ReactNode }) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      {children}
      {!!erro && <Text style={estilos.erro}>{erro}</Text>}
    </View>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 24, gap: 20 },
  etapa: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.marca700, marginTop: 4 }, // Inter: a Overpass desenha errado o "·"
  grupo: { gap: 10 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  dica: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.textoFraco },
  erro: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.erroTexto },
  linha: { flexDirection: 'row', gap: 12 },
  metade: { flex: 1 },
})
