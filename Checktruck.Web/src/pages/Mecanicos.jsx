import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Tabela, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { useCarga } from '../hooks/useCarga'
import { Button, CampoBusca } from '../components/ui/Form'
import MecanicoModal from '../components/modals/MecanicoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import AcoesLinha from '../components/ui/AcoesLinha'
import { AtivoBadge } from '../components/ui/Badges'
import { mecanicoService } from '../services'
import { contemBusca } from '../data/domain'

// Quem faz as trocas nas OS
export default function Mecanicos() {
  const { dados: mecanicos = [], carregando, erro, recarregar, tentarNovamente } = useCarga(() => mecanicoService.listar())
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // { registro } ao cadastrar/editar
  const [excluindo, setExcluindo] = useState(null)

  // Ativos primeiro, depois por nome
  const filtrados = useMemo(() => {
    return mecanicos
      .filter((m) => contemBusca(`${m.nome} ${m.funcao}`, busca))
      .sort((a, b) => (a.ativo === b.ativo ? a.nome.localeCompare(b.nome) : a.ativo ? -1 : 1))
  }, [mecanicos, busca])

  const ativos = mecanicos.filter((m) => m.ativo).length

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Mecânicos"
        subtitle={`${ativos} ativo${ativos === 1 ? '' : 's'} · quem faz as trocas nas OS`}
        action={<Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Novo mecânico</Button>}
      />

      <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por nome ou função" className="mb-5" />

      {filtrados.length === 0 ? (
        <EmptyState
          title={mecanicos.length === 0 ? 'Nenhum mecânico cadastrado' : 'Nada encontrado'}
          action={mecanicos.length === 0 && (
            <Button onClick={() => setModal({ registro: null })}>Cadastrar mecânico</Button>
          )}
        />
      ) : (
        <Tabela colunas={['Nome', 'Função', 'Situação', '']}>
          {filtrados.map((m) => (
            <tr key={m.id}>
              <td className={`px-5 py-3.5 font-semibold ${m.ativo ? 'text-stone-800' : 'text-stone-400'}`}>{m.nome}</td>
              <td className="px-5 py-3.5 text-stone-600">{m.funcao}</td>
              <td className="px-5 py-3.5"><AtivoBadge ativo={m.ativo} /></td>
              <td className="px-5 py-3.5 text-right">
                <AcoesLinha onEditar={() => setModal({ registro: m })} onExcluir={() => setExcluindo(m)} />
              </td>
            </tr>
          ))}
        </Tabela>
      )}

      {modal && <MecanicoModal registro={modal.registro} onClose={() => setModal(null)} onSalvo={recarregar} />}
      {excluindo && (
        <ConfirmarExclusaoModal
          onClose={() => setExcluindo(null)}
          titulo="Excluir mecânico"
          descricao={`Excluir "${excluindo.nome}"? Se ele já tiver OS lançadas, desative o cadastro em vez de excluir.`}
          onConfirmar={async () => {
            await mecanicoService.remover(excluindo.id)
            recarregar()
          }}
        />
      )}
    </>
  )
}
