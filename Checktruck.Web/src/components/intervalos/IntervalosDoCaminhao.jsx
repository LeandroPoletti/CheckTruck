import { useEffect, useState } from 'react'
import { Card, EmptyState, ErroCarregamento } from '../Layout'
import { Select } from '../ui/Form'
import { OrigemIntervaloBadge } from '../ui/Badges'
import AcoesLinha from '../ui/AcoesLinha'
import IntervaloModal from '../modals/IntervaloModal'
import ConfirmarExclusaoModal from '../modals/ConfirmarExclusaoModal'
import { intervaloVeiculoService } from '../../services'
import { formatKm, nomeDoCaminhao } from '../../data/domain'
import { montarLinhas, daOrigem, oQueVoltaAValer, textoPrazo } from '../../data/intervalos'

// Aba "Por caminhão": para cada item, o que vale para o caminhão escolhido (dele, da empresa, de fábrica ou o padrão).
// O intervalo próprio do caminhão (ex.: plano da concessionária) passa na frente dos outros.
// tipos já vêm filtrados pelo componente escolhido na página.
export default function IntervalosDoCaminhao({ veiculos, tipos, veiculoId, onVeiculo }) {
  const veiculo = veiculos.find((v) => v.id === veiculoId)
  const [dados, setDados] = useState({ veiculoId: null, tabela: [] })
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [modal, setModal] = useState(null) // linha da tabela enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  // Tabela do caminhão (a API manda cada item com os intervalos na ordem em que valem), de novo depois de salvar
  useEffect(() => {
    if (!veiculoId) return
    let cancelado = false
    intervaloVeiculoService.tabela(veiculoId)
      .then((tabela) => {
        if (cancelado) return
        setErro(null)
        setDados({ veiculoId, tabela })
      })
      .catch((e) => { if (!cancelado) setErro(e.message) })
    return () => { cancelado = true }
  }, [veiculoId, versao])

  const recarregar = () => setVersao((v) => v + 1)

  if (veiculos.length === 0) return <EmptyState title="Nenhum caminhão ativo" />

  const carregado = dados.veiculoId === veiculoId
  const linhas = carregado ? montarLinhas(tipos, dados.tabela) : []
  const doCaminhao = (l) => daOrigem(l, 'caminhao')

  return (
    <>
      <Select value={veiculoId ?? ''} onChange={(e) => onVeiculo(e.target.value)} className="mb-5 w-96">
        {veiculos.map((v) => <option key={v.id} value={v.id}>{v.placa} · {nomeDoCaminhao(v)} · {v.geracaoNome}</option>)}
      </Select>

      {erro && <ErroCarregamento mensagem={erro} onTentarNovamente={recarregar} />}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
              <th className="px-5 py-3">ITEM</th>
              <th className="px-5 py-3">INTERVALO</th>
              <th className="px-5 py-3">PRAZO</th>
              <th className="px-5 py-3">ORIGEM</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {!carregado && !erro && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-stone-400">Carregando intervalos do caminhão…</td></tr>
            )}
            {linhas.map((l) => {
              const proprio = l.origem === 'caminhao'
              return (
                <tr key={l.tipo.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-stone-800">{l.tipo.nome}</p>
                    <p className="text-xs text-stone-400">{l.tipo.componente}{doCaminhao(l)?.observacao && ` · ${doCaminhao(l).observacao}`}</p>
                  </td>
                  <td className={`px-5 py-3.5 ${proprio ? 'text-stone-700' : 'text-stone-400'}`}>{l.vale ? formatKm(l.vale.intervaloKm) : '—'}</td>
                  <td className={`px-5 py-3.5 ${proprio ? 'text-stone-700' : 'text-stone-400'}`}>{l.vale ? textoPrazo(l.vale.intervaloMeses) : '—'}</td>
                  <td className="px-5 py-3.5"><OrigemIntervaloBadge origem={l.origem} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {proprio ? (
                      <AcoesLinha onEditar={() => setModal(l)} onExcluir={() => setExcluindo(l)} />
                    ) : (
                      <button onClick={() => setModal(l)} className="whitespace-nowrap text-xs font-semibold text-brand-700 hover:text-brand-900">
                        Definir pro caminhão
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {modal && (
        <IntervaloModal
          veiculo={veiculo}
          tipo={modal.tipo}
          intervalo={doCaminhao(modal)}
          sugestao={modal.vale}
          onClose={() => setModal(null)}
          onSalvo={recarregar}
        />
      )}
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir intervalo do caminhão"
        descricao={excluindo && `Excluir o intervalo próprio de "${excluindo.tipo.nome}" do caminhão ${veiculo?.placa}? Ele volta a usar ${oQueVoltaAValer(excluindo, 'caminhao')}.`}
        onConfirmar={async () => {
          await intervaloVeiculoService.remover(doCaminhao(excluindo).id)
          recarregar()
        }}
      />
    </>
  )
}
