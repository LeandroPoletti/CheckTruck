import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Card } from './Layout'
import { StatusBadge, PlacaBadge } from './ui/Badges'
import {
  formatKm, formatData, formatDataHora, getHistoricoVeiculo, nomeDoCaminhao, TRACOES,
} from '../data/domain'

export function VeiculoNaoEncontrado({ backTo }) {
  const navigate = useNavigate()
  return (
    <div>
      <button onClick={() => navigate(backTo)} className="mb-4 flex items-center gap-1 text-sm text-brand-700">
        <ChevronLeft size={16} /> Voltar
      </button>
      <p className="text-stone-500">Veículo não encontrado.</p>
    </div>
  )
}

// Apresentacional: a página de detalhe carrega os dados e passa por props.
// situacao = fabricante, modelo, geração e potência, mais o status geral e os itens já calculados pela API
// (do mais urgente para o menos urgente).
export default function VeiculoDetalhePanel({ veiculo, situacao, registros, backTo, actions }) {
  const navigate = useNavigate()

  const historico = getHistoricoVeiculo(veiculo.id, registros)
  const detalhes = [
    situacao.geracaoNome,
    situacao.normaNome,
    TRACOES[situacao.tracao],
    situacao.motor && `Motor ${situacao.motor}`,
    situacao.cambio,
    veiculo.chassi && `Chassi ${veiculo.chassi}`,
    veiculo.renavam && `Renavam ${veiculo.renavam}`,
  ]

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
              <h1 className="text-xl font-bold text-stone-900">{nomeDoCaminhao(situacao)} cv</h1>
              <StatusBadge status={situacao.status} />
            </div>
            <p className="mt-1.5 text-sm text-stone-500">{detalhes.filter(Boolean).join(' · ')}</p>
          </div>
          {actions}
        </div>

        <div className="mt-5 grid grid-cols-4 gap-4 border-t border-stone-100 pt-4">
          <Info label="Km atual" value={formatKm(veiculo.kmAtual)} />
          <Info label="Motorista" value={veiculo.motoristaNome ?? 'Sem motorista'} />
          <Info label="Ano fabr./modelo" value={`${veiculo.anoFabricacao} / ${veiculo.anoModelo}`} />
          <Info label="Manutenções" value={`${historico.length} registro${historico.length === 1 ? '' : 's'}`} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-stone-900">Situação por tipo</h3>
          {situacao.itens.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">Nenhum item com intervalo para acompanhar.</p>
          ) : (
            <div className="space-y-4">
              {situacao.itens.map((s) => {
                // Quanto do intervalo já foi usado (barra cheia = na hora de trocar)
                const pct = Math.max(2, Math.min(100, ((s.intervaloKm - s.kmRestante) / s.intervaloKm) * 100))
                const barColor = s.status === 'critico' ? 'bg-red-500' : s.status === 'atencao' ? 'bg-amber-500' : 'bg-brand-600'
                const textColor = s.status === 'critico' ? 'text-red-600' : s.status === 'atencao' ? 'text-amber-600' : 'text-stone-400'
                return (
                  <div key={s.tipoId}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-stone-800">
                        {s.tipoNome} {s.isPrimeiraTroca && <span className="text-[10px] font-semibold text-amber-600">1ª TROCA</span>}
                      </span>
                      <span className={`text-right text-xs font-semibold ${textColor}`}>
                        {textoKm(s.kmRestante)}
                        {s.diasRestantes !== null && <> · {textoDias(s.diasRestantes)}</>}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
                      {r.tipoNome}
                      {r.isPrimeiraTroca && <span className="ml-2 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">1ª TROCA</span>}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatKm(r.kmNaTroca)} → próx. {formatKm(r.kmProximaTroca)}
                      {r.mecanicoNome && <> · {r.mecanicoNome}{r.mecanicoFuncao && ` (${r.mecanicoFuncao})`}</>}
                      {r.concessionaria && <> · {r.concessionaria}</>}
                    </p>
                    <p className="text-xs text-stone-400">
                      OS nº {r.id}
                      {r.motoristaNome && <> · Motorista {r.motoristaNome}</>}
                      {' · '}Lançada{r.lancadoPorNome && ` por ${r.lancadoPorNome}`} em {formatDataHora(r.lancadoEm)}
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

// Negativo = já passou do ponto de troca
const textoKm = (kmRestante) => (kmRestante > 0 ? `faltam ${formatKm(kmRestante)}` : `passou ${formatKm(-kmRestante)}`)
const textoDias = (dias) => (dias >= 0 ? `${dias} dia${dias === 1 ? '' : 's'}` : `venceu há ${-dias} dia${dias === -1 ? '' : 's'}`)

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-stone-400">{label.toUpperCase()}</p>
      <p className="mt-0.5 font-semibold text-stone-900">{value}</p>
    </div>
  )
}
