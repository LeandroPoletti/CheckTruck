import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Card, Carregando, ErroCarregamento } from '../components/Layout'
import { StatusBadge, PlacaBadge } from '../components/ui/Badges'
import { Button, Select, Input } from '../components/ui/Form'
import { Search, Plus } from 'lucide-react'
import { formatKm } from '../data/domain'
import NovoVeiculoModal from '../components/modals/NovoVeiculoModal'
import { veiculoService } from '../services'

export default function Veiculos() {
  const navigate = useNavigate()
  const [veiculos, setVeiculos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [busca, setBusca] = useState('')
  const [geracaoFiltro, setGeracaoFiltro] = useState('todas')
  const [statusFiltro, setStatusFiltro] = useState('ativos')
  const [novoOpen, setNovoOpen] = useState(false)

  // Uma request: a API devolve cada veículo com modelo, geração, motorista e situação já calculada
  useEffect(() => {
    let cancelado = false
    veiculoService.listarSituacao()
      .then((lista) => { if (!cancelado) setVeiculos(lista) })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [versao])

  // Após salvar: atualiza em segundo plano, sem desmontar a tela (e os modais abertos)
  function recarregar() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  function tentarNovamente() {
    setCarregando(true)
    recarregar()
  }

  const ativos = veiculos.filter((v) => v.ativo).length
  const inativos = veiculos.length - ativos

  // Opções do filtro: só as gerações que têm veículos
  const geracoes = useMemo(() => {
    const porId = new Map(veiculos.map((v) => [v.geracaoId, v.geracaoNome]))
    return [...porId].map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [veiculos])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return veiculos.filter((v) => {
      if (statusFiltro === 'ativos' && !v.ativo) return false
      if (statusFiltro === 'inativos' && v.ativo) return false
      if (geracaoFiltro !== 'todas' && v.geracaoId !== geracaoFiltro) return false
      if (termo && !`${v.placa} ${v.chassi || ''} ${v.motoristaNome || ''}`.toLowerCase().includes(termo)) return false
      return true
    })
  }, [veiculos, busca, geracaoFiltro, statusFiltro])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

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
          const { status, itemMaisUrgente: item } = v
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
              <p className="mt-2.5 font-semibold text-stone-900">{v.modeloNome} · {v.potenciaCv} cv</p>
              <p className="text-xs text-stone-500">
                {v.geracaoNome} · {v.anoFabricacao}/{v.anoModelo} · 6×4
              </p>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-stone-800">{formatKm(v.kmAtual)}</span>
                {item && <span className="text-stone-400">próx. {formatKm(item.kmProximaTroca)}</span>}
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-sm">
                <span className="text-stone-600">{v.motoristaNome ?? 'Sem motorista'}</span>
                <button
                  onClick={() => navigate(`/veiculos/${v.id}`)}
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

      <NovoVeiculoModal open={novoOpen} onClose={() => setNovoOpen(false)} onSalvo={recarregar} />
    </>
  )
}
