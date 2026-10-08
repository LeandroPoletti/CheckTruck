import { useEffect, useState } from 'react'
import { Card, EmptyState, ErroCarregamento } from '../Layout'
import { Select } from '../ui/Form'
import { OrigemIntervaloBadge } from '../ui/Badges'
import AcoesLinha from '../ui/AcoesLinha'
import IntervaloModal from '../modals/IntervaloModal'
import ConfirmarExclusaoModal from '../modals/ConfirmarExclusaoModal'
import { intervaloService, filtro } from '../../services'
import { formatKm } from '../../data/domain'
import { montarLinhas, textoPrazo } from '../../data/intervalos'

// Aba "Por modelo": todos os itens, com o intervalo do modelo ou o padrão do sistema que vale para ele.
// tipos já vêm filtrados pelo componente escolhido na página.
export default function IntervalosDoModelo({ modelos, geracoes, tipos, modeloId, onModelo }) {
  const modelo = modelos.find((m) => m.id === modeloId)
  const [dados, setDados] = useState({ modeloId: null, intervalos: [], padrao: [] })
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [modal, setModal] = useState(null) // linha da tabela enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  // Intervalos do modelo ($filter=Modelo/Id eq X) e o padrão do sistema para ele, de novo depois de salvar
  useEffect(() => {
    if (!modeloId) return
    let cancelado = false
    Promise.all([intervaloService.listar(filtro.porId('Modelo', modeloId)), intervaloService.listarPadrao(modeloId)])
      .then(([intervalos, padrao]) => {
        if (cancelado) return
        setErro(null)
        setDados({ modeloId, intervalos, padrao })
      })
      .catch((e) => { if (!cancelado) setErro(e.message) })
    return () => { cancelado = true }
  }, [modeloId, versao])

  const recarregar = () => setVersao((v) => v + 1)

  if (modelos.length === 0) return <EmptyState title="Nenhum modelo cadastrado" subtitle="Cadastre os modelos em Cadastros → Modelos." />

  const carregado = dados.modeloId === modeloId
  const linhas = carregado ? montarLinhas(tipos, { doModelo: dados.intervalos, padrao: dados.padrao }) : []

  return (
    <>
      <Select value={modeloId ?? ''} onChange={(e) => onModelo(e.target.value)} className="mb-5 w-80">
        {modelos.map((m) => {
          const g = geracoes.find((gg) => gg.id === m.geracaoId)
          return <option key={m.id} value={m.id}>{m.nome} · {g?.nome}</option>
        })}
      </Select>

      {erro && <ErroCarregamento mensagem={erro} onTentarNovamente={recarregar} />}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
              <th className="px-5 py-3">ITEM</th>
              <th className="px-5 py-3">INTERVALO</th>
              <th className="px-5 py-3">1ª TROCA</th>
              <th className="px-5 py-3">PRAZO</th>
              <th className="px-5 py-3">ORIGEM</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {!carregado && !erro && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-stone-400">Carregando intervalos do modelo…</td></tr>
            )}
            {linhas.map((l) => {
              const proprio = l.origem === 'modelo'
              return (
                <tr key={l.tipo.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-stone-800">{l.tipo.nome}</p>
                    <p className="text-xs text-stone-400">{l.tipo.componente}{l.modelo?.fonte && ` · ${l.modelo.fonte}`}</p>
                  </td>
                  <td className={`px-5 py-3.5 ${proprio ? 'text-stone-700' : 'text-stone-400'}`}>{l.vale ? formatKm(l.vale.intervaloKm) : '—'}</td>
                  <td className="px-5 py-3.5">
                    {l.modelo?.intervaloKmPrimeira
                      ? <span className="font-semibold text-amber-600">{formatKm(l.modelo.intervaloKmPrimeira)}</span>
                      : <span className="text-stone-400">{l.vale ? 'igual ao intervalo' : '—'}</span>}
                  </td>
                  <td className={`px-5 py-3.5 ${proprio ? 'text-stone-700' : 'text-stone-400'}`}>{l.vale ? textoPrazo(l.vale.intervaloMeses) : '—'}</td>
                  <td className="px-5 py-3.5"><OrigemIntervaloBadge origem={l.origem} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {proprio ? (
                      <AcoesLinha onEditar={() => setModal(l)} onExcluir={() => setExcluindo(l)} />
                    ) : (
                      <button onClick={() => setModal(l)} className="whitespace-nowrap text-xs font-semibold text-brand-700 hover:text-brand-900">
                        Definir pro modelo
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <span className="mr-1 rounded-full bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-700">1ª TROCA</span>
        Quando o registro de manutenção marca primeira troca, o sistema usa o intervalo de
        amaciamento em vez do padrão. Câmbio Gen 4/5 zerômetro: 200.000 km. Diferencial Meritor: 10.000 km.
      </div>

      {modal && (
        <IntervaloModal
          modelo={modelo}
          tipo={modal.tipo}
          intervalo={modal.modelo}
          sugestao={modal.padrao}
          onClose={() => setModal(null)}
          onSalvo={recarregar}
        />
      )}
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir intervalo do modelo"
        descricao={excluindo && `Excluir o intervalo de "${excluindo.tipo.nome}" do ${modelo?.nome}? Os caminhões deste modelo passam a usar ${
          excluindo.padrao ? 'o padrão do sistema' : 'nada (o item deixa de ser acompanhado)'
        }, menos os que têm intervalo próprio.`}
        onConfirmar={async () => {
          await intervaloService.remover(excluindo.modelo.id)
          recarregar()
        }}
      />
    </>
  )
}
