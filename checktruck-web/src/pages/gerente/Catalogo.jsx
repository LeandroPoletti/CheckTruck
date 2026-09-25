import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { PageHeader, Card } from '../../components/Layout'
import { Button } from '../../components/ui/Form'

export default function Catalogo() {
  const { fabricantes, geracoes, modelos, veiculos, intervalos } = useApp()
  const [fabricanteId, setFabricanteId] = useState(fabricantes[0]?.id)
  const [geracaoId, setGeracaoId] = useState(null)

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

  return (
    <>
      <PageHeader
        title="Catálogo"
        subtitle="Fabricantes, gerações e modelos usados no cadastro de veículos"
        action={<Button><Plus size={16} /> Novo modelo</Button>}
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
            <button className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-50">
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
            <button className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-50">
              + Geração
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold tracking-wide text-stone-400">
              MODELOS · {geracaoAtiva?.nome?.toUpperCase() || '—'}
            </p>
            <button className="text-xs font-semibold text-brand-600 hover:text-brand-800">+ Modelo</button>
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
    </>
  )
}
