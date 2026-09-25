import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card } from './Layout'
import { StatusBadge, PlacaBadge } from './ui/Badges'
import { getModeloCompleto, getSituacaoVeiculo, getHistoricoVeiculo, getStatusGeralVeiculo, formatKm, formatData } from '../data/domain'

export default function VeiculoDetalhePanel({ backTo, actions }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { veiculos, usuarios, registros } = useApp()

  const veiculo = veiculos.find((v) => v.id === id)
  if (!veiculo) {
    return (
      <div>
        <button onClick={() => navigate(backTo)} className="mb-4 flex items-center gap-1 text-sm text-brand-700">
          <ChevronLeft size={16} /> Voltar
        </button>
        <p className="text-stone-500">Veículo não encontrado.</p>
      </div>
    )
  }

  const mc = getModeloCompleto(veiculo.modeloId)
  const situacao = getSituacaoVeiculo(veiculo, registros)
  const historico = getHistoricoVeiculo(veiculo.id, registros)
  const motorista = usuarios.find((u) => u.id === veiculo.motoristaId)
  const status = getStatusGeralVeiculo(veiculo, registros)

  return (
    <>
      <button
        onClick={() => navigate(backTo)}
        className="mb-4 flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-900"
      >
        <ChevronLeft size={16} /> Veículos
      </button>

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <PlacaBadge placa={veiculo.placa} size="lg" />
              <h1 className="text-xl font-bold text-stone-900">
                {mc?.fabricante?.nome} {mc?.modelo?.nome}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="mt-1.5 text-sm text-stone-500">
              {mc?.geracao?.nome} · {mc?.geracao?.motor} · {mc?.geracao?.cambio}
              {veiculo.chassi && <> · Chassi {veiculo.chassi}</>}
              {veiculo.renavam && <> · Renavam {veiculo.renavam}</>}
            </p>
          </div>
          {actions}
        </div>

        <div className="mt-5 grid grid-cols-4 gap-4 border-t border-stone-100 pt-4">
          <Info label="Km atual" value={formatKm(veiculo.kmAtual)} />
          <Info label="Motorista" value={motorista ? motorista.nome : 'Sem motorista'} />
          <Info label="Ano fabr./modelo" value={`${veiculo.anoFabricacao} / ${veiculo.anoModelo}`} />
          <Info label="Manutenções" value={`${historico.length} registro${historico.length === 1 ? '' : 's'}`} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-stone-900">Situação por tipo</h3>
          <div className="space-y-4">
            {situacao.map((s) => {
              const pct = Math.max(2, Math.min(100, (veiculo.kmAtual / s.kmProximaTroca) * 100))
              const barColor = s.status === 'critico' ? 'bg-red-500' : s.status === 'atencao' ? 'bg-amber-500' : 'bg-brand-600'
              const textColor = s.status === 'critico' ? 'text-red-600' : s.status === 'atencao' ? 'text-amber-600' : 'text-stone-400'
              return (
                <div key={s.tipoId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-800">
                      {s.tipo?.nome} {s.isPrimeira && <span className="text-[10px] font-semibold text-amber-600">1ª TROCA</span>}
                    </span>
                    <span className={`text-xs font-semibold ${textColor}`}>
                      {s.kmRestante <= 0 ? '+' : '−'}{formatKm(Math.abs(s.kmRestante))}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-stone-900">Histórico de manutenções</h3>
          {historico.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">Nenhuma manutenção registrada ainda.</p>
          ) : (
            <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
              {historico.map((r) => (
                <div key={r.id} className="flex gap-3 border-b border-stone-100 pb-3 last:border-0">
                  <div className="w-14 shrink-0 text-xs leading-tight text-stone-400">
                    {formatData(r.dataRealizacao)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-800">
                      {situacao.find((s) => s.tipoId === r.tipoId)?.tipo?.nome || r.tipoId}
                      {r.isPrimeiraTroca && <span className="ml-2 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">1ª TROCA</span>}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatKm(r.kmNaTroca)} → próx. {formatKm(r.kmProximaTroca)} · {r.concessionaria}
                      {r.nrNotaFiscal && <> · NF {r.nrNotaFiscal}</>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-stone-400">{label.toUpperCase()}</p>
      <p className="mt-0.5 font-semibold text-stone-900">{value}</p>
    </div>
  )
}
