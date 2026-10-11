import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Tabela, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { useCarga } from '../hooks/useCarga'
import { Button, CampoBusca } from '../components/ui/Form'
import { AcoesDoCatalogo } from '../components/ui/AcoesLinha'
import FabricanteModal from '../components/modals/FabricanteModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { fabricanteService } from '../services'
import { contemBusca } from '../data/domain'

export default function Fabricantes() {
  // O DTO do fabricante já traz o país, então basta uma request
  const { dados: fabricantes = [], carregando, erro, recarregar, tentarNovamente } = useCarga(() => fabricanteService.listar())
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // { registro } ao cadastrar/editar
  const [excluindo, setExcluindo] = useState(null)

  const filtrados = useMemo(() => {
    return fabricantes
      .filter((f) => contemBusca(`${f.nome} ${f.pais ?? ''}`, busca))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [fabricantes, busca])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Fabricantes"
        subtitle={`${fabricantes.length} cadastrado${fabricantes.length === 1 ? '' : 's'}`}
        action={<Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Novo fabricante</Button>}
      />

      <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por nome ou país" className="mb-5" />

      {filtrados.length === 0 ? (
        <EmptyState
          title={fabricantes.length === 0 ? 'Nenhum fabricante cadastrado' : 'Nenhum fabricante encontrado'}
          action={fabricantes.length === 0 && <Button onClick={() => setModal({ registro: null })}>Cadastrar fabricante</Button>}
        />
      ) : (
        <Tabela colunas={['NOME', 'PAÍS DE ORIGEM', '']}>
          {filtrados.map((f) => (
            <tr key={f.id}>
              <td className="px-5 py-3.5 font-semibold text-stone-800">{f.nome}</td>
              <td className="px-5 py-3.5 text-stone-500">{f.pais ?? '—'}</td>
              <td className="px-5 py-3.5 text-right">
                <AcoesDoCatalogo item={f} onEditar={() => setModal({ registro: f })} onExcluir={() => setExcluindo(f)} />
              </td>
            </tr>
          ))}
        </Tabela>
      )}

      <FabricanteModal open={!!modal} registro={modal?.registro} onClose={() => setModal(null)} onSalvo={recarregar} />
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir fabricante"
        descricao={`Excluir "${excluindo?.nome}"? Não é possível excluir um fabricante que tenha gerações.`}
        onConfirmar={async () => {
          await fabricanteService.remover(excluindo.id)
          recarregar()
        }}
      />
    </>
  )
}
