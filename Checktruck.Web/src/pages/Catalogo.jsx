import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, Carregando, ErroCarregamento } from '../components/Layout'
import { Button } from '../components/ui/Form'
import { fabricanteService, geracaoService, modeloService, veiculoService, intervaloService } from '../services'
import FabricanteModal from '../components/modals/FabricanteModal'
import GeracaoModal from '../components/modals/GeracaoModal'
import ModeloModal from '../components/modals/ModeloModal'

const VAZIO = { fabricantes: [], geracoes: [], modelos: [], veiculos: [], intervalos: [] }

export default function Catalogo() {
  const [selecionadoId, setFabricanteId] = useState(null)
  const [geracaoId, setGeracaoId] = useState(null)
  const [dados, setDados] = useState(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [modalAberto, setModalAberto] = useState(null) // 'fabricante' | 'geracao' | 'modelo'

  useEffect(() => {
    let cancelado = false
    Promise.all([
      fabricanteService.listar(),
      geracaoService.listar(),
      modeloService.listar(),
      veiculoService.listar(),
      intervaloService.listar(),
    ])
      .then(([fabricantes, geracoes, modelos, veiculos, intervalos]) => {
        if (!cancelado) setDados({ fabricantes, geracoes, modelos, veiculos, intervalos })
      })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [versao])

  // Após salvar: atualiza em segundo plano, sem desmontar a tela
  function recarregar() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  function tentarNovamente() {
    setCarregando(true)
    recarregar()
  }

  const { fabricantes, geracoes, modelos, veiculos, intervalos } = dados
  // sem seleção explícita, o primeiro fabricante carregado fica ativo
  const fabricanteId = selecionadoId ?? fabricantes[0]?.id

  const geracoesDoFabricante = useMemo(
    () => geracoes.filter((g) => g.fabricanteId === fabricanteId),
    [geracoes, fabricanteId]
  )
  const geracaoAtiva = geracoesDoFabricante.find((g) => g.id === geracaoId) || geracoesDoFabricante[0]
  const modelosDaGeracao = useMemo(
    () => (geracaoAtiva ? modelos.filter((m) => m.geracaoId === geracaoAtiva.id) : []),
    [modelos, geracaoAtiva]
  )

  function veiculosDoModelo(modeloId) {
    return veiculos.filter((v) => v.modeloId === modeloId && v.ativo).length
  }
  function intervalosDoModelo(modeloId) {
    return intervalos.filter((i) => i.modeloId === modeloId).length
  }

  // Pré-seleção dos modais a partir da coluna ativa (memo para não resetar o formulário a cada render)
  const iniciaisGeracao = useMemo(() => ({ fabricanteId: fabricanteId ?? '' }), [fabricanteId])
  const iniciaisModelo = useMemo(() => ({ geracaoId: geracaoAtiva?.id ?? '' }), [geracaoAtiva?.id])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Catálogo"
        subtitle="Fabricantes, gerações e modelos usados no cadastro de veículos"
        action={<Button onClick={() => setModalAberto('modelo')}><Plus size={16} /> Novo modelo</Button>}
      />

      <div className="grid grid-cols-3 gap-5">
        <Card className="p-4">
          <p className="mb-3 text-xs font-bold tracking-wide text-stone-400">FABRICANTE</p>
          <div className="space-y-1">
            {fabricantes.map((f) => {
              const qtdGeracoes = geracoes.filter((g) => g.fabricanteId === f.id).length
              const ativo = f.id === fabricanteId
              return (
                <button
                  key={f.id}
                  onClick={() => { setFabricanteId(f.id); setGeracaoId(null) }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition ${
                    ativo ? 'bg-brand-50 text-brand-800' : 'hover:bg-stone-50'
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold">{f.nome}</span>
                    <span className="block text-xs text-stone-400">{f.pais} · {qtdGeracoes} gerações</span>
                  </span>
                  <span className="text-stone-300">›</span>
                </button>
              )
            })}
            <button
              onClick={() => setModalAberto('fabricante')}
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-50"
            >
              + Fabricante
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="mb-3 text-xs font-bold tracking-wide text-stone-400">
            GERAÇÃO · {fabricantes.find((f) => f.id === fabricanteId)?.nome?.toUpperCase()}
          </p>
          <div className="space-y-1">
            {geracoesDoFabricante.length === 0 && (
              <p className="px-3 py-4 text-sm text-stone-400">Nenhuma geração cadastrada.</p>
            )}
            {geracoesDoFabricante.map((g) => {
              const ativo = g.id === (geracaoAtiva && geracaoAtiva.id)
              return (
                <button
                  key={g.id}
                  onClick={() => setGeracaoId(g.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                    ativo ? 'border-brand-500 bg-brand-50' : 'border-transparent hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-sm font-semibold text-stone-900">{g.nome}</span>
                  <span className="block text-xs text-stone-400">{g.periodo} · {g.motor.split(' ')[0]} · {g.norma}</span>
                </button>
              )
            })}
            <button
              onClick={() => setModalAberto('geracao')}
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-50"
            >
              + Geração
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold tracking-wide text-stone-400">
              MODELOS · {geracaoAtiva?.nome?.toUpperCase() || '—'}
            </p>
            <button
              onClick={() => setModalAberto('modelo')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800"
            >
              + Modelo
            </button>
          </div>
          <div className="space-y-3">
            {modelosDaGeracao.map((m) => (
              <div key={m.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900">{m.nome}</span>
                  <span className="text-xs text-stone-400">
                    {veiculosDoModelo(m.id)} veículos · {intervalosDoModelo(m.id)} intervalos
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs text-stone-500">
                  <div>
                    <p className="font-semibold text-stone-800">{m.potenciaCv} cv</p>
                    <p>Potência</p>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{m.eixoDianteiroPneus} pneus</p>
                    <p>Eixo diant.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{m.tandem ? '2 eixos' : '1 eixo'}</p>
                    <p>Tandem tras.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{m.pneusPorEixoTraseiro}</p>
                    <p>Pneus/eixo</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone-400">
            Todos os FH cavalo são 6×4 com tandem duplo Meritor.
          </p>
        </Card>
      </div>

      <FabricanteModal
        open={modalAberto === 'fabricante'}
        onClose={() => setModalAberto(null)}
        onSalvo={(f) => { setFabricanteId(f.id); setGeracaoId(null); recarregar() }}
      />
      <GeracaoModal
        open={modalAberto === 'geracao'}
        valoresIniciais={iniciaisGeracao}
        onClose={() => setModalAberto(null)}
        onSalvo={(g) => { setFabricanteId(g.fabricanteId); setGeracaoId(g.id); recarregar() }}
      />
      <ModeloModal
        open={modalAberto === 'modelo'}
        valoresIniciais={iniciaisModelo}
        onClose={() => setModalAberto(null)}
        onSalvo={recarregar}
      />
    </>
  )
}
