import { useEffect, useState } from 'react'
import { Card, EmptyState, ErroCarregamento } from '../Layout'
import { Select } from '../ui/Form'
import { OrigemIntervaloBadge } from '../ui/Badges'
import AcoesLinha from '../ui/AcoesLinha'
import IntervaloModal from '../modals/IntervaloModal'
import ConfirmarExclusaoModal from '../modals/ConfirmarExclusaoModal'
import { intervaloService } from '../../services'
import { obterUsuario } from '../../services/sessao'
import { ehDonoDoSistema } from '../../data/acesso'
import { formatKm, nomeDoModelo, agruparPorModelo } from '../../data/domain'
import { montarLinhas, daOrigem, oQueVoltaAValer, textoPrazo } from '../../data/intervalos'

// Aba "Por geração": todos os itens, com o intervalo que vale para a geração (da empresa, de fábrica ou o padrão).
// O dono do sistema cadastra o de fábrica; a empresa cadastra o dela, que vale antes do de fábrica.
// tipos já vêm filtrados pelo componente escolhido na página.
export default function IntervalosDaGeracao({ geracoes, tipos, geracaoId, onGeracao }) {
  const dono = ehDonoDoSistema(obterUsuario())
  const geracao = geracoes.find((g) => g.id === geracaoId)
  const [dados, setDados] = useState({ geracaoId: null, tabela: [] })
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [modal, setModal] = useState(null) // linha da tabela enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  // Tabela da geração (a API manda cada item com os intervalos na ordem em que valem), de novo depois de salvar
  useEffect(() => {
    if (!geracaoId) return
    let cancelado = false
    intervaloService.tabela(geracaoId)
      .then((tabela) => {
        if (cancelado) return
        setErro(null)
        setDados({ geracaoId, tabela })
      })
      .catch((e) => { if (!cancelado) setErro(e.message) })
    return () => { cancelado = true }
  }, [geracaoId, versao])

  const recarregar = () => setVersao((v) => v + 1)

  if (geracoes.length === 0) return <EmptyState title="Nenhuma geração cadastrada" subtitle="Cadastre as gerações em Cadastros → Gerações." />

  const carregado = dados.geracaoId === geracaoId
  const linhas = carregado ? montarLinhas(tipos, dados.tabela) : []

  // O intervalo que quem está logado cadastra e muda aqui: o de fábrica (dono do sistema) ou o da empresa
  const minhaOrigem = dono ? 'fabrica' : 'empresa'
  const meu = (l) => daOrigem(l, minhaOrigem)

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
              const proprio = !!meu(l)
              return (
                <tr key={l.tipo.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-stone-800">{l.tipo.nome}</p>
                    <p className="text-xs text-stone-400">{l.tipo.componente}{l.vale?.fonte && ` · ${l.vale.fonte}`}</p>
                  </td>
                  <td className={`px-5 py-3.5 ${proprio ? 'text-stone-700' : 'text-stone-400'}`}>{l.vale ? formatKm(l.vale.intervaloKm) : '—'}</td>
                  <td className="px-5 py-3.5">
                    {l.vale?.intervaloKmPrimeira
                      ? <span className="font-semibold text-amber-600">{formatKm(l.vale.intervaloKmPrimeira)}</span>
                      : <span className="text-stone-400">{l.vale ? 'igual ao intervalo' : '—'}</span>}
                  </td>
                  <td className={`px-5 py-3.5 ${proprio ? 'text-stone-700' : 'text-stone-400'}`}>{l.vale ? textoPrazo(l.vale.intervaloMeses) : '—'}</td>
                  <td className="px-5 py-3.5"><OrigemIntervaloBadge origem={l.origem} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {proprio ? (
                      <AcoesLinha onEditar={() => setModal(l)} onExcluir={() => setExcluindo(l)} />
                    ) : (
                      <button onClick={() => setModal(l)} className="whitespace-nowrap text-xs font-semibold text-brand-700 hover:text-brand-900">
                        {dono ? 'Definir de fábrica' : 'Definir pra empresa'}
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
          intervalo={meu(modal)}
          sugestao={modal.vale}
          onClose={() => setModal(null)}
          onSalvo={recarregar}
        />
      )}
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo={dono ? 'Excluir intervalo de fábrica' : 'Excluir intervalo da empresa'}
        descricao={excluindo && `Excluir o intervalo de "${excluindo.tipo.nome}" da geração ${geracao && `${nomeDoModelo(geracao)} · ${geracao.nome}`}? Os caminhões desta geração passam a usar ${
          oQueVoltaAValer(excluindo, minhaOrigem)
        }, menos os que têm intervalo ${dono ? 'da empresa ou ' : ''}do caminhão.`}
        onConfirmar={async () => {
          await intervaloService.remover(meu(excluindo).id)
          recarregar()
        }}
      />
    </>
  )
}
