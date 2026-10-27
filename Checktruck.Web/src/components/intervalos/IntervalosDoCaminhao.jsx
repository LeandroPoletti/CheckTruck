import { useState } from 'react'
import { Tabela, EmptyState, ErroCarregamento } from '../Layout'
import { Select } from '../ui/Form'
import { OrigemIntervaloBadge } from '../ui/Badges'
import AcoesLinha, { BotaoLinha } from '../ui/AcoesLinha'
import IntervaloModal from '../modals/IntervaloModal'
import ConfirmarExclusaoModal from '../modals/ConfirmarExclusaoModal'
import { intervaloVeiculoService } from '../../services'
import { useCargaDaTela } from '../../hooks/useCarga'
import { formatKm, nomeDoCaminhao } from '../../data/domain'
import { montarLinhas, daOrigem, oQueVoltaAValer, textoPrazo } from '../../data/intervalos'

// Aba "Por caminhão": para cada item, o que vale para o caminhão escolhido (dele, da empresa, de fábrica ou o padrão).
// O intervalo próprio do caminhão (ex.: plano da concessionária) passa na frente dos outros.
// tipos já vêm filtrados pelo componente escolhido na página.
export default function IntervalosDoCaminhao({ veiculos, tipos, veiculoId, onVeiculo }) {
  const veiculo = veiculos.find((v) => v.id === veiculoId)
  // Tabela do caminhão (a API manda cada item com os intervalos na ordem em que valem), de novo depois de salvar
  const { dados: tabela = [], carregando, erro, recarregar, tentarNovamente } =
    useCargaDaTela(() => (veiculoId ? intervaloVeiculoService.tabela(veiculoId) : Promise.resolve([])), [veiculoId])
  const [modal, setModal] = useState(null) // linha da tabela enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  if (veiculos.length === 0) return <EmptyState title="Nenhum caminhão ativo" />

  const linhas = carregando ? [] : montarLinhas(tipos, tabela)
  const doCaminhao = (l) => daOrigem(l, 'caminhao')

  return (
    <>
      <Select value={veiculoId ?? ''} onChange={(e) => onVeiculo(e.target.value)} className="mb-5 w-96">
        {veiculos.map((v) => <option key={v.id} value={v.id}>{v.placa} · {nomeDoCaminhao(v)} · {v.geracaoNome}</option>)}
      </Select>

      {erro && <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />}

      <Tabela colunas={['Item', 'Intervalo', 'Prazo', 'Origem', '']}>
        {carregando && (
          <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-stone-400">Carregando intervalos do caminhão…</td></tr>
        )}
        {linhas.map((l) => {
          const proprio = l.origem === 'caminhao'
          return (
            <tr key={l.tipo.id}>
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
                  <BotaoLinha onClick={() => setModal(l)}>Definir pro caminhão</BotaoLinha>
                )}
              </td>
            </tr>
          )
        })}
      </Tabela>

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
      {excluindo && (
        <ConfirmarExclusaoModal
          onClose={() => setExcluindo(null)}
          titulo="Excluir intervalo do caminhão"
          descricao={`Excluir o intervalo próprio de "${excluindo.tipo.nome}" do caminhão ${veiculo?.placa}? Ele volta a usar ${oQueVoltaAValer(excluindo, 'caminhao')}.`}
          onConfirmar={async () => {
            await intervaloVeiculoService.remover(doCaminhao(excluindo).id)
            recarregar()
          }}
        />
      )}
    </>
  )
}
