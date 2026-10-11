import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader, Tabela, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca, Select } from '../components/ui/Form'
import { PlacaBadge } from '../components/ui/Badges'
import AcoesLinha from '../components/ui/AcoesLinha'
import OrdemServicoModal from '../components/modals/OrdemServicoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { manutencaoService } from '../services'
import { useCarga } from '../hooks/useCarga'
import { obterUsuario } from '../services/sessao'
import { pode, ehAutonomo } from '../data/acesso'
import { formatKm, formatData, formatDataHora, contemBusca } from '../data/domain'

// Todas as ordens de serviço da frota, da mais nova para a mais velha.
// Ver: Ver frota. Lançar, corrigir e excluir: Ordem de serviço.
export default function OrdensServico() {
  const navigate = useNavigate()
  const usuario = obterUsuario()
  const podeMexer = pode(usuario, 'OrdemServico')
  const autonomo = ehAutonomo(usuario) // sem motorista: é o próprio dono

  const { dados: ordens = [], carregando, erro, recarregar, tentarNovamente } = useCarga(() => manutencaoService.listar())
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('')
  const [modal, setModal] = useState(null) // { registro } (null ao lançar) enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  // Tipos que aparecem nas OS, para o filtro
  const tipos = useMemo(
    () => [...new Map(ordens.map((o) => [o.tipoId, o.tipoNome])).entries()].sort((a, b) => a[1].localeCompare(b[1])),
    [ordens],
  )

  const filtradas = useMemo(() => {
    return ordens
      .filter((o) => !tipo || o.tipoId === tipo)
      .filter((o) => contemBusca(o.placa, busca) || o.id === busca.trim())
      .sort((a, b) => b.dataRealizacao.localeCompare(a.dataRealizacao) || Number(b.id) - Number(a.id))
  }, [ordens, busca, tipo])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Ordens de serviço"
        subtitle={`${ordens.length} lançada${ordens.length === 1 ? '' : 's'} · trocas feitas nos caminhões da frota`}
        action={podeMexer && <Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Lançar OS</Button>}
      />

      <div className="mb-5 flex gap-3">
        <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por placa ou nº da OS" className="flex-1" />
        <Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-64">
          <option value="">Tipo: todos</option>
          {tipos.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
        </Select>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          title={ordens.length === 0 ? 'Nenhuma OS lançada' : 'Nenhuma OS encontrada'}
          action={ordens.length === 0 && podeMexer && <Button onClick={() => setModal({ registro: null })}>Lançar OS</Button>}
        />
      ) : (
        <Tabela colunas={['OS', 'CAMINHÃO', 'SERVIÇO', 'KM', 'MECÂNICO', 'LANÇADA', podeMexer && '']}>
          {filtradas.map((o) => (
            <tr key={o.id} className="align-top">
              <td className="px-5 py-3.5">
                <p className="font-semibold text-stone-800">nº {o.id}</p>
                <p className="text-xs text-stone-400">{formatData(o.dataRealizacao)}</p>
              </td>
              <td className="px-5 py-3.5">
                <button onClick={() => navigate(`/veiculos/${o.veiculoId}`)}>
                  <PlacaBadge placa={o.placa} size="sm" />
                </button>
                {!autonomo && <p className="mt-1 text-xs text-stone-400">{o.motoristaNome ?? 'Sem motorista'}</p>}
              </td>
              <td className="px-5 py-3.5">
                <p className="font-medium text-stone-800">
                  {o.tipoNome}
                  {o.isPrimeiraTroca && <span className="ml-2 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">1ª TROCA</span>}
                </p>
                {o.concessionaria && <p className="text-xs text-stone-400">{o.concessionaria}</p>}
              </td>
              <td className="px-5 py-3.5 text-stone-700">
                <p>{formatKm(o.kmNaTroca)}</p>
                <p className="text-xs text-stone-400">próx. {formatKm(o.kmProximaTroca)}</p>
              </td>
              <td className="px-5 py-3.5 text-stone-700">{o.mecanicoNome}</td>
              <td className="px-5 py-3.5">
                <p className="text-stone-700">{o.lancadoPorNome ?? '—'}</p>
                <p className="text-xs text-stone-400">{formatDataHora(o.lancadoEm)}</p>
              </td>
              {podeMexer && (
                <td className="px-5 py-3.5 text-right">
                  <AcoesLinha onEditar={() => setModal({ registro: o })} onExcluir={() => setExcluindo(o)} />
                </td>
              )}
            </tr>
          ))}
        </Tabela>
      )}

      {modal && <OrdemServicoModal registro={modal.registro} onClose={() => setModal(null)} onSalvo={recarregar} />}
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir ordem de serviço"
        descricao={`Excluir a OS nº ${excluindo?.id} (${excluindo?.tipoNome}) do caminhão ${excluindo?.placa}? Ela sai do histórico e a próxima troca desse item volta a ser calculada pela OS anterior. Não dá para desfazer.`}
        onConfirmar={async () => {
          await manutencaoService.remover(excluindo.id)
          recarregar()
        }}
      />
    </>
  )
}
