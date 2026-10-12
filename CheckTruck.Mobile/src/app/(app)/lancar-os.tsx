import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { caminhoesDaFrota, situacaoDoCaminhao, type Caminhao, type CaminhaoNaLista } from '@/servicos/caminhoes'
import {
  cadastrarMecanico, mecanicosAtivos, motoristasAtivos, tiposDeManutencao,
  type Mecanico, type Motorista, type TipoDeManutencao,
} from '@/servicos/cadastros'
import { lancarOrdem } from '@/servicos/ordens'
import { dataDoCampo, dataParaCampo, formatKm, hoje, mascaraData } from '@/dados/formato'
import { ORIGENS_INTERVALO } from '@/dados/intervalos'
import { ANO_MINIMO } from '@/dados/caminhoes'
import Botao from '@/componentes/Botao'
import CabecalhoDoModal from '@/componentes/CabecalhoDoModal'
import Campo from '@/componentes/Campo'
import Escolha from '@/componentes/Escolha'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, coresDoStatus, fontes } from '@/tema'

const porNome = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome)

type Listas = { caminhoes: CaminhaoNaLista[]; tipos: TipoDeManutencao[]; mecanicos: Mecanico[]; motoristas: Motorista[] }
/** isPrimeiraTroca null = segue a sugestão do caminhão. */
type Item = { tipoId: number; isPrimeiraTroca: boolean | null }

// Lançar uma ordem de serviço, igual ao web: um ou mais itens trocados e quem fez (no Autônomo, "oficina ou mecânico").
// Na Frota tem também o motorista que estava com o caminhão. Aberta pelo caminhão, já vem com ele escolhido.
export default function LancarOs() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const { chamar, usuario } = useSessao()
  const frota = usuario?.tipoConta === 'Frota'
  const podeCadastrar = !!usuario?.permissoes.includes('Cadastros')

  const [listas, setListas] = useState<Listas | null>(null)
  const [erroCarga, setErroCarga] = useState('')
  const [veiculoId, setVeiculoId] = useState<number | null>(null)
  const [situacao, setSituacao] = useState<Caminhao | null>(null)
  const [itens, setItens] = useState<Item[]>([])
  const [mecanicoIds, setMecanicoIds] = useState<number[]>([])
  const [motoristaId, setMotoristaId] = useState('')
  const [km, setKm] = useState('')
  const [data, setData] = useState(dataParaCampo(hoje()))
  const [concessionaria, setConcessionaria] = useState('')
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Listas do formulário, uma vez ao abrir. Aberta pelo caminhão (ou com um caminhão só), ele já vem escolhido
  useEffect(() => {
    async function carregar() {
      try {
        const [caminhoes, tipos, mecanicos, motoristas] = await Promise.all([
          caminhoesDaFrota(chamar),
          tiposDeManutencao(chamar),
          mecanicosAtivos(chamar),
          frota ? motoristasAtivos(chamar) : Promise.resolve([]),
        ])
        const carregadas = {
          caminhoes: caminhoes.filter((c) => c.ativo).sort((a, b) => a.placa.localeCompare(b.placa)),
          tipos: [...tipos].sort(porNome),
          mecanicos: [...mecanicos].sort(porNome),
          motoristas,
        }
        setListas(carregadas)
        const inicial = carregadas.caminhoes.find((c) => c.id === Number(id)) ?? (carregadas.caminhoes.length === 1 ? carregadas.caminhoes[0] : null)
        if (inicial) escolherCaminhao(inicial, motoristas)
      } catch (e) {
        setErroCarga(e instanceof Error ? e.message : 'Não foi possível carregar.')
      }
    }
    carregar()
  }, [])

  // Situação do caminhão escolhido: o intervalo que vale para cada item (a dica) e se a próxima troca é a 1ª
  useEffect(() => {
    if (veiculoId === null) return
    setSituacao(null)
    situacaoDoCaminhao(chamar, veiculoId)
      .then(setSituacao)
      .catch((e) => setErroCarga(e instanceof Error ? e.message : 'Não foi possível carregar o caminhão.'))
  }, [chamar, veiculoId])

  // Escolher o caminhão já traz o km e o motorista dele, e a 1ª troca volta a seguir a sugestão
  function escolherCaminhao(caminhao: CaminhaoNaLista, motoristas = listas?.motoristas ?? []) {
    setVeiculoId(caminhao.id)
    setKm(String(caminhao.kmAtual))
    const doCaminhao = caminhao.motoristaAtual?.id ?? ''
    setMotoristaId(motoristas.some((m) => m.id === doCaminhao) ? doCaminhao : '')
    setItens((atuais) => atuais.map((i) => ({ ...i, isPrimeiraTroca: null })))
  }

  const doCaminhao = (tipoId: number) => situacao?.itens.find((i) => i.tipoManutencaoId === tipoId)
  const sugerePrimeira = (tipoId: number) => !!doCaminhao(tipoId)?.isPrimeiraTroca
  const primeiraTroca = (item: Item) => item.isPrimeiraTroca ?? sugerePrimeira(item.tipoId)

  function tocarNoItem(tipoId: number) {
    setItens((atuais) => (atuais.some((i) => i.tipoId === tipoId)
      ? atuais.filter((i) => i.tipoId !== tipoId)
      : [...atuais, { tipoId, isPrimeiraTroca: null }]))
  }

  function marcarPrimeiraTroca(tipoId: number, isPrimeiraTroca: boolean) {
    setItens((atuais) => atuais.map((i) => (i.tipoId === tipoId ? { ...i, isPrimeiraTroca } : i)))
  }

  function tocarNoMecanico(mecanicoId: number) {
    setMecanicoIds((atuais) => (atuais.includes(mecanicoId) ? atuais.filter((m) => m !== mecanicoId) : [...atuais, mecanicoId]))
  }

  function cadastrado(mecanico: Mecanico) {
    setListas((l) => (l ? { ...l, mecanicos: [...l.mecanicos, mecanico].sort(porNome) } : l))
    setMecanicoIds((atuais) => [...atuais, mecanico.id])
  }

  async function lancar() {
    const kmNaTroca = Number(km)
    const dataDaTroca = dataDoCampo(data)
    if (veiculoId === null) { setErro('Escolha o caminhão.'); return }
    if (itens.length === 0) { setErro('Escolha pelo menos um item trocado.'); return }
    if (mecanicoIds.length === 0) { setErro(frota ? 'Escolha pelo menos um mecânico.' : 'Escolha pelo menos uma oficina ou mecânico.'); return }
    // OS antiga pode ter km menor que o atual; só não aceita km inválido
    if (km === '' || !Number.isInteger(kmNaTroca) || kmNaTroca < 0) { setErro('Informe o km do caminhão na troca (sem negativo).'); return }
    // A troca já foi feita: a data vai de 1900 até hoje
    if (!dataDaTroca || dataDaTroca < `${ANO_MINIMO}-01-01` || dataDaTroca > hoje()) {
      setErro(`A data da troca vai de ${ANO_MINIMO} até hoje.`)
      return
    }

    setSalvando(true)
    setErro('')
    try {
      await lancarOrdem(chamar, {
        veiculoId,
        data: dataDaTroca,
        km: kmNaTroca,
        itens: itens.map((i) => ({ tipoManutencaoId: i.tipoId, isPrimeiraTroca: primeiraTroca(i) })),
        mecanicoIds,
        motoristaId: motoristaId || null,
        concessionaria,
        observacao,
      })
      router.back()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível lançar a OS.')
      setSalvando(false)
    }
  }

  const placa = listas?.caminhoes.find((c) => c.id === veiculoId)?.placa
  const escolheuPeloCaminhao = !!id

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoDoModal titulo="Lançar OS" placa={placa} />
          <MensagemErro>{erroCarga}</MensagemErro>
          {!listas && !erroCarga && <ActivityIndicator color={cores.marca700} />}

          {listas && (
            <>
              {!escolheuPeloCaminhao && listas.caminhoes.length > 1 && (
                <View style={estilos.grupo}>
                  <Text style={estilos.rotulo}>Caminhão</Text>
                  <Escolha
                    opcoes={listas.caminhoes.map((c) => ({ id: c.id, nome: c.placa }))}
                    escolhidos={veiculoId === null ? [] : [veiculoId]}
                    aoTocar={(cid) => escolherCaminhao(listas.caminhoes.find((c) => c.id === cid)!)}
                  />
                </View>
              )}

              <View style={estilos.grupo}>
                <Text style={estilos.rotulo}>O que foi trocado?</Text>
                <Escolha opcoes={listas.tipos} escolhidos={itens.map((i) => i.tipoId)} aoTocar={tocarNoItem} multipla />
                {itens.length > 0 && (
                  <View style={estilos.itens}>
                    {itens.map((item, i) => {
                      const intervalo = doCaminhao(item.tipoId)
                      const nome = listas.tipos.find((t) => t.id === item.tipoId)?.nome
                      return (
                        <View key={item.tipoId} style={[estilos.item, i > 0 && estilos.itemComLinha]}>
                          <View style={estilos.itemTextos}>
                            <Text style={estilos.itemNome}>{nome}</Text>
                            {intervalo && (
                              <Text style={estilos.dica}>
                                Vale o intervalo {ORIGENS_INTERVALO[intervalo.origemIntervalo]}: {formatKm(intervalo.intervaloKm)}
                              </Text>
                            )}
                          </View>
                          <View style={estilos.primeira}>
                            <Text style={estilos.dica}>{sugerePrimeira(item.tipoId) ? '1ª troca (sugerido)' : '1ª troca'}</Text>
                            <Switch
                              value={primeiraTroca(item)}
                              onValueChange={(v) => marcarPrimeiraTroca(item.tipoId, v)}
                              trackColor={{ true: cores.marca500, false: cores.borda }}
                              thumbColor={cores.branco}
                              accessibilityLabel={`1ª troca de ${nome}`}
                            />
                          </View>
                        </View>
                      )
                    })}
                  </View>
                )}
                <Text style={estilos.dica}>
                  A próxima troca de cada item é calculada pelo intervalo do caminhão, da empresa, de fábrica ou pelo padrão.
                </Text>
              </View>

              <View style={estilos.grupo}>
                <Text style={estilos.rotulo}>{frota ? 'Mecânicos' : 'Oficina ou mecânico'}</Text>
                {listas.mecanicos.length > 0 && (
                  <Escolha
                    opcoes={listas.mecanicos.map((m) => ({ id: m.id, nome: `${m.nome} (${m.funcao})` }))}
                    escolhidos={mecanicoIds}
                    aoTocar={tocarNoMecanico}
                    multipla
                  />
                )}
                {listas.mecanicos.length === 0 && (
                  <Text style={estilos.aviso}>
                    {podeCadastrar ? 'Nada cadastrado ainda.' : 'Nenhum mecânico cadastrado. Peça para quem cuida dos cadastros.'}
                  </Text>
                )}
                {podeCadastrar && <CadastroRapido frota={frota} aoCadastrar={cadastrado} />}
              </View>

              {frota && (
                <View style={estilos.grupo}>
                  <Text style={estilos.rotulo}>Motorista</Text>
                  <Escolha
                    opcoes={[{ id: '', nome: 'Sem motorista' }, ...listas.motoristas]}
                    escolhidos={[motoristaId]}
                    aoTocar={setMotoristaId}
                  />
                  <Text style={estilos.dica}>Quem estava com o caminhão. Se escolher alguém, ele vira o motorista atual do caminhão.</Text>
                </View>
              )}

              <View style={estilos.linha}>
                <View style={estilos.metade}>
                  <Campo
                    rotulo="Km na troca"
                    value={km}
                    onChangeText={(texto) => setKm(texto.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    placeholder="Ex.: 125400"
                  />
                </View>
                <View style={estilos.metade}>
                  <Campo
                    rotulo="Data da troca"
                    value={data}
                    onChangeText={(texto) => setData(mascaraData(texto))}
                    keyboardType="number-pad"
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                  />
                </View>
              </View>

              <Campo
                rotulo="Concessionária / oficina"
                value={concessionaria}
                onChangeText={setConcessionaria}
                placeholder="Opcional"
                maxLength={150}
              />
              <Campo
                rotulo="Observações"
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Opcional"
                linhas={3}
                maxLength={500}
              />

              <MensagemErro>{erro}</MensagemErro>
              <Botao titulo="Lançar OS" onPress={lancar} ocupado={salvando} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// Cadastrar a oficina ou o mecânico ali mesmo, sem sair da OS (permissão Cadastros). Já entra escolhido.
function CadastroRapido({ frota, aoCadastrar }: { frota: boolean; aoCadastrar(mecanico: Mecanico): void }) {
  const { chamar } = useSessao()
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [funcao, setFuncao] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  if (!aberto) {
    return (
      <Botao
        titulo={frota ? 'Cadastrar mecânico' : 'Cadastrar oficina ou mecânico'}
        tipo="discreto"
        icone="plus"
        onPress={() => setAberto(true)}
      />
    )
  }

  async function salvar() {
    if (!nome.trim()) { setErro(frota ? 'Informe o nome do mecânico.' : 'Informe o nome.'); return }
    if (!funcao.trim()) {
      setErro(frota ? 'Informe a função (ex.: mecânico, borracheiro).' : 'Informe a função (ex.: oficina, mecânico, borracheiro).')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      aoCadastrar(await cadastrarMecanico(chamar, nome, funcao))
      setAberto(false)
      setNome('')
      setFuncao('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível cadastrar.')
    }
    setSalvando(false)
  }

  return (
    <View style={estilos.cadastro}>
      <Campo rotulo="Nome" value={nome} onChangeText={setNome} placeholder={frota ? 'Marco Rueda' : 'Oficina do Zé'} maxLength={150} />
      <Campo rotulo="Função" value={funcao} onChangeText={setFuncao} placeholder={frota ? 'Borracheiro' : 'Oficina'} maxLength={100} />
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
  conteudo: { padding: 24, gap: 22 },
  grupo: { gap: 10 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  dica: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.textoFraco },
  aviso: { fontFamily: fontes.texto, fontSize: 13, color: coresDoStatus.atencao.texto },
  itens: { backgroundColor: cores.fundo, borderRadius: 16, paddingHorizontal: 14 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  itemComLinha: { borderTopWidth: 1, borderTopColor: cores.borda },
  itemTextos: { flex: 1, gap: 2 },
  itemNome: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  primeira: { alignItems: 'flex-end', gap: 4 },
  linha: { flexDirection: 'row', gap: 12 },
  metade: { flex: 1 },
  cadastro: { borderWidth: 1, borderColor: cores.borda, borderRadius: 16, padding: 14, gap: 12 },
})
