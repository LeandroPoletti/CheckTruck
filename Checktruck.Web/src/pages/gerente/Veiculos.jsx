import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { PageHeader, Card } from '../../components/Layout'
import { StatusBadge, PlacaBadge } from '../../components/ui/Badges'
import { Button, Select, Input } from '../../components/ui/Form'
import { Search, Plus } from 'lucide-react'
import { getModeloCompleto, getStatusGeralVeiculo, getItemMaisUrgente, formatKm } from '../../data/domain'
import NovoVeiculoModal from '../../components/modals/NovoVeiculoModal'

export default function Veiculos() {
  const { veiculos, usuarios, registros, geracoes } = useApp()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [geracaoFiltro, setGeracaoFiltro] = useState('todas')
  const [statusFiltro, setStatusFiltro] = useState('ativos')
  const [novoOpen, setNovoOpen] = useState(false)

  const ativos = veiculos.filter((v) => v.ativo).length
  const inativos = veiculos.filter((v) => !v.ativo).length

  const filtrados = useMemo(() => {
    return veiculos.filter((v) => {
      if (statusFiltro === 'ativos' && !v.ativo) return false
      if (statusFiltro === 'inativos' && v.ativo) return false
      const mc = getModeloCompleto(v.modeloId)
      if (geracaoFiltro !== 'todas' && mc?.geracao?.id !== geracaoFiltro) return false
      if (busca.trim()) {
        const motorista = usuarios.find((u) => u.id === v.motoristaId)
        const alvo = `${v.placa} ${v.chassi || ''} ${motorista?.nome || ''}`.toLowerCase()
        if (!alvo.includes(busca.trim().toLowerCase())) return false
      }
      return true
    })
  }, [veiculos, usuarios, busca, geracaoFiltro, statusFiltro])

  return (
    <>
      <PageHeader
        title="Veículos"
        subtitle={`${ativos} ativos · ${inativos} desativado${inativos === 1 ? '' : 's'}`}
        action={
          <Button onClick={() => setNovoOpen(true)}>
            <Plus size={16} /> Novo veículo
          </Button>
        }
      />

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
        <Select value={geracaoFiltro} onChange={(e) => setGeracaoFiltro(e.target.value)} className="w-56">
          <option value="todas">Geração: todas</option>
          {geracoes.map((g) => (
            <option key={g.id} value={g.id}>{g.nome}</option>
          ))}
        </Select>
        <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)} className="w-40">
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
          <option value="todos">Status: todos</option>
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
            <Card
              key={v.id}
              className={`flex flex-col border-l-4 p-4 ${
                status === 'critico' ? 'border-l-red-500' : status === 'atencao' ? 'border-l-amber-500' : 'border-l-brand-500'
              } ${!v.ativo ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <PlacaBadge placa={v.placa} />
                <StatusBadge status={v.ativo ? status : 'ok'} />
              </div>
              <p className="mt-2.5 font-semibold text-stone-900">{mc?.modelo?.nome} · {mc?.modelo?.potenciaCv} cv</p>
              <p className="text-xs text-stone-500">
                {mc?.geracao?.nome} · {v.anoFabricacao}/{v.anoModelo} · 6×4
              </p>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-stone-800">{formatKm(v.kmAtual)}</span>
                {item && <span className="text-stone-400">próx. {formatKm(item.kmProximaTroca)}</span>}
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-sm">
                <span className="text-stone-600">{motorista ? motorista.nome : 'Sem motorista'}</span>
                <button
                  onClick={() => navigate(`/gerente/veiculos/${v.id}`)}
                  className="font-semibold text-brand-700 hover:text-brand-900"
                >
                  Detalhes
                </button>
              </div>
            </Card>
          )
        })}

        <button
          onClick={() => setNovoOpen(true)}
          className="flex min-h-[190px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-stone-300 text-stone-400 transition hover:border-brand-400 hover:text-brand-600"
        >
          <Plus size={22} />
          <span className="text-sm font-semibold">Cadastrar veículo</span>
          <span className="text-xs">placa · chassi · modelo obrigatório</span>
        </button>
      </div>

      <NovoVeiculoModal open={novoOpen} onClose={() => setNovoOpen(false)} />
    </>
  )
}
