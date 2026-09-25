import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { PageHeader, Card } from '../../components/Layout'
import { StatusBadge, PlacaBadge } from '../../components/ui/Badges'
import { Input, Select } from '../../components/ui/Form'
import { getModeloCompleto, getStatusGeralVeiculo, getItemMaisUrgente, formatKm } from '../../data/domain'

export default function MecanicoVeiculos() {
  const { veiculos, usuarios, registros, geracoes } = useApp()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('todos')

  const ativos = veiculos.filter((v) => v.ativo)

  const filtrados = useMemo(() => {
    return ativos.filter((v) => {
      if (statusFiltro !== 'todos' && getStatusGeralVeiculo(v, registros) !== statusFiltro) return false
      if (busca.trim()) {
        const motorista = usuarios.find((u) => u.id === v.motoristaId)
        const alvo = `${v.placa} ${v.chassi || ''} ${motorista?.nome || ''}`.toLowerCase()
        if (!alvo.includes(busca.trim().toLowerCase())) return false
      }
      return true
    })
  }, [ativos, usuarios, registros, busca, statusFiltro])

  return (
    <>
      <PageHeader title="Veículos" subtitle={`${ativos.length} veículos na frota`} />

      <div className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por placa, chassi ou motorista"
            className="pl-9"
          />
        </div>
        <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="w-48">
          <option value="todos">Status: todos</option>
          <option value="critico">Crítico</option>
          <option value="atencao">Atenção</option>
          <option value="ok">OK</option>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtrados.map((v) => {
          const mc = getModeloCompleto(v.modeloId)
          const status = getStatusGeralVeiculo(v, registros)
          const item = getItemMaisUrgente(v, registros)
          const motorista = usuarios.find((u) => u.id === v.motoristaId)
          const pct = item ? Math.max(2, Math.min(100, (v.kmAtual / item.kmProximaTroca) * 100)) : 0
          const barColor = status === 'critico' ? 'bg-red-500' : status === 'atencao' ? 'bg-amber-500' : 'bg-brand-600'

          return (
            <button key={v.id} onClick={() => navigate(`/mecanico/veiculos/${v.id}`)} className="text-left">
              <Card
                className={`flex h-full flex-col border-l-4 p-4 transition hover:shadow-md ${
                  status === 'critico' ? 'border-l-red-500' : status === 'atencao' ? 'border-l-amber-500' : 'border-l-brand-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <PlacaBadge placa={v.placa} />
                  <StatusBadge status={status} />
                </div>
                <p className="mt-2.5 font-semibold text-stone-900">{mc?.modelo?.nome} · {mc?.modelo?.potenciaCv} cv</p>
                <p className="text-xs text-stone-500">{mc?.geracao?.nome} · {v.anoFabricacao}/{v.anoModelo}</p>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-stone-800">{formatKm(v.kmAtual)}</span>
                  {item && <span className="text-stone-400">próx. {formatKm(item.kmProximaTroca)}</span>}
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="mt-4 border-t border-stone-100 pt-3 text-sm text-stone-600">
                  {motorista ? motorista.nome : 'Sem motorista'}
                </div>
              </Card>
            </button>
          )
        })}
      </div>
    </>
  )
}
