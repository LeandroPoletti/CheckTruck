import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Card } from './Layout'
import { Button } from './ui/Form'
import { StatusBadge, PlacaBadge, SeloPrimeiraTroca } from './ui/Badges'
import { BarraDeUso } from './ui/BarraDeUso'
import {
  formatKm, formatData, formatDataHora, getHistoricoVeiculo, nomeDoCaminhao, textoDias, TRACOES, ORIGENS_KM,
} from '../data/domain'

export function VeiculoNaoEncontrado({ backTo }) {
  const navigate = useNavigate()
  return (
    <div>
      <Button variant="secondary" size="sm" onClick={() => navigate(backTo)} className="mb-4">
        <ChevronLeft size={16} /> Voltar
      </Button>
      <p className="text-stone-500">Veículo não encontrado.</p>
    </div>
  )
}

// Apresentacional: a página de detalhe carrega os dados e passa por props.
// situacao = fabricante, modelo, geração e potência, mais o status geral e os itens já calculados pela API
// (do mais urgente para o menos urgente). ordens = as OS do caminhão. historicoKm = toda mudança de km,
// da mais nova para a mais velha.
export default function VeiculoDetalhePanel({ veiculo, situacao, ordens, historicoKm, backTo, actions }) {
  const navigate = useNavigate()

  const historico = getHistoricoVeiculo(veiculo.id, ordens)
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
      <Button variant="secondary" size="sm" onClick={() => navigate(backTo)} className="mb-4">
        <ChevronLeft size={16} /> Veículos
      </Button>

      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <PlacaBadge placa={veiculo.placa} size="lg" />
              <h1 className="text-2xl font-extrabold text-stone-900">{nomeDoCaminhao(situacao)} cv</h1>
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
          <h3 className="mb-4 text-xl font-bold text-stone-900">Situação por tipo</h3>
          {situacao.itens.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">Nenhum item com intervalo para acompanhar.</p>
          ) : (
            <div className="space-y-4">
              {situacao.itens.map((s) => {
                const textColor = s.status === 'critico' ? 'text-red-600' : s.status === 'atencao' ? 'text-amber-600' : 'text-stone-400'
                return (
                  <div key={s.tipoId}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-stone-800">
                        {s.tipoNome} {s.isPrimeiraTroca && <span className="text-xs font-semibold text-amber-700">1ª troca</span>}
                      </span>
                      <span className={`text-right text-xs font-semibold ${textColor}`}>
                        {textoKm(s.kmRestante)}
                        {s.diasRestantes !== null && <> · {textoDias(s.diasRestantes)}</>}
                      </span>
                    </div>
                    <BarraDeUso percentual={s.percentualUsado} status={s.status} />
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-xl font-bold text-stone-900">Histórico de manutenções</h3>
          {historico.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">Nenhuma manutenção registrada ainda.</p>
          ) : (
            <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
              {historico.map((os) => (
                <div key={os.id} className="flex gap-3 border-b border-stone-100 pb-3 last:border-0">
                  <div className="w-14 shrink-0 text-xs leading-tight text-stone-400">
                    {formatData(os.dataRealizacao)}
                  </div>
                  <div className="flex-1">
                    {os.itens.map((i) => (
                      <p key={i.tipoId} className="text-sm font-semibold text-stone-800">
                        {i.tipoNome}
                        {i.isPrimeiraTroca && <SeloPrimeiraTroca />}
                        <span className="ml-2 text-xs font-normal text-stone-500">próx. {formatKm(i.kmProximaTroca)}</span>
                      </p>
                    ))}
                    <p className="text-xs text-stone-500">
                      {formatKm(os.kmNaTroca)}
                      {os.mecanicos.length > 0 && <> · {os.mecanicos.map((m) => `${m.nome}${m.funcao ? ` (${m.funcao})` : ''}`).join(', ')}</>}
                      {os.concessionaria && <> · {os.concessionaria}</>}
                    </p>
                    <p className="text-xs text-stone-400">
                      OS nº {os.id}
                      {os.motoristaNome && <> · Motorista {os.motoristaNome}</>}
                      {' · '}Lançada{os.lancadoPorNome && ` por ${os.lancadoPorNome}`} em {formatDataHora(os.lancadoEm)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="col-span-2 p-5">
          <h3 className="mb-4 text-xl font-bold text-stone-900">Histórico de km</h3>
          {historicoKm.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">Nenhuma mudança de km registrada ainda.</p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto pr-1">
              <table className="w-full text-sm">
                <tbody>
                  {historicoKm.map((h) => (
                    <tr key={h.id} className="border-b border-stone-100 align-top last:border-0">
                      <td className="w-36 py-2.5 pr-3 text-xs text-stone-400">{formatDataHora(h.registradoEm)}</td>
                      <td className="w-36 py-2.5 pr-3">
                        <span className={`font-medium ${h.origem === 'Correcao' ? 'text-amber-700' : 'text-stone-700'}`}>
                          {textoOrigemKm(h)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-stone-700">
                        {h.kmAnterior === null ? formatKm(h.kmNovo) : <>{formatKm(h.kmAnterior)} → {formatKm(h.kmNovo)}</>}
                        {h.kmAnterior !== null && (
                          <span className={`ml-2 text-xs ${h.kmNovo < h.kmAnterior ? 'text-amber-700' : 'text-stone-400'}`}>
                            ({h.kmNovo > h.kmAnterior ? '+' : '−'}{formatKm(Math.abs(h.kmNovo - h.kmAnterior))})
                          </span>
                        )}
                        {h.motivo && <p className="text-xs text-stone-500">Motivo: {h.motivo}</p>}
                      </td>
                      <td className="py-2.5 text-right text-xs text-stone-400">{h.registradoPorNome ? `por ${h.registradoPorNome}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

// "OS nº 12" quando foi uma OS (ou "OS excluída", se ela saiu); o resto pelo nome da origem
function textoOrigemKm(h) {
  if (h.origem !== 'OrdemServico') return ORIGENS_KM[h.origem] ?? h.origem
  return h.ordemServicoId ? `OS nº ${h.ordemServicoId}` : 'OS excluída'
}

// Negativo = já passou do ponto de troca
const textoKm = (kmRestante) => (kmRestante > 0 ? `faltam ${formatKm(kmRestante)}` : `passou ${formatKm(-kmRestante)}`)

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-0.5 font-semibold text-stone-900">{value}</p>
    </div>
  )
}
