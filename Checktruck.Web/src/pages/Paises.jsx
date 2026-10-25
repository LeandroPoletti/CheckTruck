import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Tabela, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { useCarga } from '../hooks/useCarga'
import { Button, CampoBusca } from '../components/ui/Form'
import PaisModal from '../components/modals/PaisModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { AcoesDoCatalogo } from '../components/ui/AcoesLinha'
import { paisService } from '../services'
import { contemBusca } from '../data/domain'

export default function Paises() {
  const { dados: paises = [], carregando, erro, recarregar, tentarNovamente } = useCarga(() => paisService.listar())
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // { registro } ao cadastrar/editar
  const [excluindo, setExcluindo] = useState(null)

  const filtrados = useMemo(() => {
    return paises
      .filter((p) => contemBusca(p.nome, busca))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [paises, busca])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Países"
        subtitle={`${paises.length} cadastrado${paises.length === 1 ? '' : 's'} · origem dos fabricantes`}
        action={<Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Novo país</Button>}
      />

      <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por nome" className="mb-5" />

      {filtrados.length === 0 ? (
        <EmptyState
          title={paises.length === 0 ? 'Nenhum país cadastrado' : 'Nenhum país encontrado'}
          action={paises.length === 0 && <Button onClick={() => setModal({ registro: null })}>Cadastrar país</Button>}
        />
      ) : (
        <Tabela colunas={['Nome', '']}>
          {filtrados.map((p) => (
            <tr key={p.id}>
              <td className="px-5 py-3.5 font-semibold text-stone-800">{p.nome}</td>
              <td className="px-5 py-3.5 text-right">
                <AcoesDoCatalogo item={p} onEditar={() => setModal({ registro: p })} onExcluir={() => setExcluindo(p)} />
              </td>
            </tr>
          ))}
        </Tabela>
      )}

      {modal && <PaisModal registro={modal.registro} onClose={() => setModal(null)} onSalvo={recarregar} />}
      {excluindo && (
        <ConfirmarExclusaoModal
          onClose={() => setExcluindo(null)}
          titulo="Excluir país"
          descricao={`Excluir "${excluindo.nome}"? Não é possível excluir um país que tenha fabricantes.`}
          onConfirmar={async () => {
            await paisService.remover(excluindo.id)
            recarregar()
          }}
        />
      )}
    </>
  )
}
