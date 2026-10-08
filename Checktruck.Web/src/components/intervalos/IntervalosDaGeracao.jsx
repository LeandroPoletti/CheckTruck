import { useEffect, useState } from 'react'
import { Card, EmptyState, ErroCarregamento } from '../Layout'
import { Select } from '../ui/Form'
import { OrigemIntervaloBadge } from '../ui/Badges'
import AcoesLinha from '../ui/AcoesLinha'
import IntervaloModal from '../modals/IntervaloModal'
import ConfirmarExclusaoModal from '../modals/ConfirmarExclusaoModal'
import { intervaloService, filtro } from '../../services'
import { formatKm, nomeDoModelo, agruparPorModelo } from '../../data/domain'
import { montarLinhas, textoPrazo } from '../../data/intervalos'

// Aba "Por geração": todos os itens, com o intervalo da geração ou o padrão do sistema que vale para ela.
// tipos já vêm filtrados pelo componente escolhido na página.
export default function IntervalosDaGeracao({ geracoes, tipos, geracaoId, onGeracao }) {
  const geracao = geracoes.find((g) => g.id === geracaoId)
  const [dados, setDados] = useState({ geracaoId: null, intervalos: [], padrao: [] })
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [modal, setModal] = useState(null) // linha da tabela enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  // Intervalos da geração ($filter=Geracao/Id eq X) e o padrão do sistema para ela, de novo depois de salvar
  useEffect(() => {
    if (!geracaoId) return
    let cancelado = false
    Promise.all([intervaloService.listar(filtro.porId('Geracao', geracaoId)), intervaloService.listarPadrao(geracaoId)])
      .then(([intervalos, padrao]) => {
        if (cancelado) return
        setErro(null)
        setDados({ geracaoId, intervalos, padrao })
      })
      .catch((e) => { if (!cancelado) setErro(e.message) })
    return () => { cancelado = true }
  }, [geracaoId, versao])

  const recarregar = () => setVersao((v) => v + 1)

  if (geracoes.length === 0) return <EmptyState title="Nenhuma geração cadastrada" subtitle="Cadastre as gerações em Cadastros → Gerações." />

  const carregado = dados.geracaoId === geracaoId
  const linhas = carregado ? montarLinhas(tipos, { daGeracao: dados.intervalos, padrao: dados.padrao }) : []

  return (
    <>
      <Select value={geracaoId ?? ''} onChange={(e) => onGeracao(e.target.value)} className="mb-5 w-96">
        {agruparPorModelo(geracoes).map(([modelo, lista]) => (
          <optgroup key={modelo} label={modelo}>
            {lista.map((g) => <option key={g.id} value={g.id}>{modelo} · {g.nome} · {g.periodo}</option>)}
          </optgroup>
        ))}
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
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-stone-400">Carregando intervalos da geração…</td></tr>
            )}
            {linhas.map((l) => {
              const proprio = l.origem === 'geracao'
              return (
                <tr key={l.tipo.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-stone-800">{l.tipo.nome}</p>
                    <p className="text-xs text-stone-400">{l.tipo.componente}{l.geracao?.fonte && ` · ${l.geracao.fonte}`}</p>
                  </td>
                  <td className={`px-5 py-3.5 ${proprio ? 'text-stone-700' : 'text-stone-400'}`}>{l.vale ? formatKm(l.vale.intervaloKm) : '—'}</td>
                  <td className="px-5 py-3.5">
                    {l.geracao?.intervaloKmPrimeira
                      ? <span className="font-semibold text-amber-600">{formatKm(l.geracao.intervaloKmPrimeira)}</span>
                      : <span className="text-stone-400">{l.vale ? 'igual ao intervalo' : '—'}</span>}
                  </td>
                  <td className={`px-5 py-3.5 ${proprio ? 'text-stone-700' : 'text-stone-400'}`}>{l.vale ? textoPrazo(l.vale.intervaloMeses) : '—'}</td>
                  <td className="px-5 py-3.5"><OrigemIntervaloBadge origem={l.origem} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {proprio ? (
                      <AcoesLinha onEditar={() => setModal(l)} onExcluir={() => setExcluindo(l)} />
                    ) : (
                      <button onClick={() => setModal(l)} className="whitespace-nowrap text-xs font-semibold text-brand-700 hover:text-brand-900">
                        Definir pra geração
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
        amaciamento em vez do padrão. Ex.: Volvo FH 4/5 zero km, câmbio com 200.000 km e diferencial Meritor com 10.000 km.
      </div>

      {modal && (
        <IntervaloModal
          geracao={geracao}
          tipo={modal.tipo}
          intervalo={modal.geracao}
          sugestao={modal.padrao}
          onClose={() => setModal(null)}
          onSalvo={recarregar}
        />
      )}
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir intervalo da geração"
        descricao={excluindo && `Excluir o intervalo de "${excluindo.tipo.nome}" da geração ${geracao && `${nomeDoModelo(geracao)} · ${geracao.nome}`}? Os caminhões desta geração passam a usar ${
          excluindo.padrao ? 'o padrão do sistema' : 'nada (o item deixa de ser acompanhado)'
        }, menos os que têm intervalo próprio.`}
        onConfirmar={async () => {
          await intervaloService.remover(excluindo.geracao.id)
          recarregar()
        }}
      />
    </>
  )
}
