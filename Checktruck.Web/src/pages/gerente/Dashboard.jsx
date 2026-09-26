import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Card, PageHeader } from '../../components/Layout'
import { StatusBadge, PlacaBadge } from '../../components/ui/Badges'
import { Button } from '../../components/ui/Form'
import {
  getStatusGeralVeiculo, getItemMaisUrgente, getModeloCompleto, formatKm,
} from '../../data/domain'
import NovoVeiculoModal from '../../components/modals/NovoVeiculoModal'
import NovaPessoaModal from '../../components/modals/NovaPessoaModal'

export default function GerenteDashboard() {
  const { veiculos, registros, geracoes } = useApp()
  const navigate = useNavigate()
  const [novoVeiculoOpen, setNovoVeiculoOpen] = useState(false)
  const [novaPessoaOpen, setNovaPessoaOpen] = useState(null) // 'motorista' | 'tecnico' | null

  const ativos = useMemo(() => veiculos.filter((v) => v.ativo), [veiculos])

  const contagem = useMemo(() => {
    const c = { ok: 0, atencao: 0, critico: 0 }
    ativos.forEach((v) => { c[getStatusGeralVeiculo(v, registros)] += 1 })
    return c
  }, [ativos, registros])

  const alertas = useMemo(() => {
    return ativos
      .map((v) => ({ veiculo: v, item: getItemMaisUrgente(v, registros) }))
      .filter((a) => a.item && a.item.status !== 'ok')
      .sort((a, b) => a.item.kmRestante - b.item.kmRestante)
      .slice(0, 5)
  }, [ativos, registros])

  const frotaPorGeracao = useMemo(() => {
    const total = ativos.length || 1
    return geracoes
      .map((g) => {
        const qtd = ativos.filter((v) => {
          const mc = getModeloCompleto(v.modeloId)
          return mc?.geracao?.id === g.id
        }).length
        return { geracao: g, qtd, pct: (qtd / total) * 100 }
      })
      .filter((g) => g.qtd > 0)
  }, [ativos, geracoes])

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`${ativos.length} veículos ativos · atualizado agora`}
      />

      <div className="grid grid-cols-4 gap-4">
        <Card className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-stone-400">FROTA ATIVA</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">{ativos.length}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-stone-400">OK</p>
          <p className="mt-1 text-3xl font-bold text-brand-700">{contagem.ok}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-stone-400">ATENÇÃO</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{contagem.atencao}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-stone-400">CRÍTICO</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{contagem.critico}</p>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
          <h3 className="mb-4 font-semibold text-stone-900">Alertas de manutenção</h3>
          {alertas.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">Nenhum alerta ativo. Frota em dia.</p>
          ) : (
            <div className="space-y-4">
              {alertas.map(({ veiculo, item }) => {
                const mc = getModeloCompleto(veiculo.modeloId)
                const pct = Math.max(0, Math.min(100, (veiculo.kmAtual / item.kmProximaTroca) * 100))
                return (
                  <button
                    key={veiculo.id + item.tipoId}
                    onClick={() => navigate(`/gerente/veiculos/${veiculo.id}`)}
                    className="block w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlacaBadge placa={veiculo.placa} size="sm" />
                        <span className="text-sm text-stone-500">
                          {mc?.modelo?.nome} · {mc?.geracao?.nome}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-stone-800">{item.tipo?.nome}</span>
                      <span className="text-stone-500">
                        {formatKm(veiculo.kmAtual)} / {formatKm(item.kmProximaTroca)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full ${item.status === 'critico' ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={`mt-1 text-xs ${item.status === 'critico' ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.kmRestante <= 0
                        ? `Vencido há ${formatKm(Math.abs(item.kmRestante))}`
                        : `Faltam ${formatKm(item.kmRestante)} · dentro da margem de 5.000 km`}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="mb-4 font-semibold text-stone-900">Cadastros rápidos</h3>
            <div className="space-y-2">
              <Button className="w-full justify-center" onClick={() => setNovoVeiculoOpen(true)}>
                Novo veículo
              </Button>
              <Button variant="secondary" className="w-full justify-center" onClick={() => setNovaPessoaOpen('motorista')}>
                Novo motorista
              </Button>
              <Button variant="secondary" className="w-full justify-center" onClick={() => setNovaPessoaOpen('tecnico')}>
                Novo técnico
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-4 font-semibold text-stone-900">Frota por geração</h3>
            <div className="space-y-3">
              {frotaPorGeracao.map(({ geracao, qtd, pct }) => (
                <div key={geracao.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-700">{geracao.nome}</span>
                    <span className="font-semibold text-stone-900">{qtd}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <NovoVeiculoModal open={novoVeiculoOpen} onClose={() => setNovoVeiculoOpen(false)} />
      <NovaPessoaModal
        open={!!novaPessoaOpen}
        perfilInicial={novaPessoaOpen === 'tecnico' ? 'mecanico' : 'motorista'}
        onClose={() => setNovaPessoaOpen(null)}
      />
    </>
  )
}
