import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Tabela, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { useCarga } from '../hooks/useCarga'
import { Button, CampoBusca } from '../components/ui/Form'
import TipoManutencaoModal from '../components/modals/TipoManutencaoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { AcoesDoCatalogo } from '../components/ui/AcoesLinha'
import { tipoManutencaoService } from '../services'
import { contemBusca } from '../data/domain'

// Itens que o sistema acompanha nos caminhões (óleo do motor, filtro de ar...)
export default function TiposManutencao() {
  const { dados: tipos = [], carregando, erro, recarregar, tentarNovamente } = useCarga(() => tipoManutencaoService.listar())
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // { registro } (null ao cadastrar) enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  const filtrados = useMemo(() => {
    return tipos
      .filter((t) => contemBusca(`${t.nome} ${t.componente}`, busca))
      .sort((a, b) => a.componenteId - b.componenteId || a.nome.localeCompare(b.nome))
  }, [tipos, busca])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Tipos de manutenção"
        subtitle={`${tipos.length} cadastrado${tipos.length === 1 ? '' : 's'} · itens que o sistema acompanha em cada caminhão`}
        action={<Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Novo tipo</Button>}
      />

      <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por nome ou componente" className="mb-5" />

      {filtrados.length === 0 ? (
        <EmptyState
          title={tipos.length === 0 ? 'Nenhum tipo cadastrado' : 'Nenhum tipo encontrado'}
          action={tipos.length === 0 && <Button onClick={() => setModal({ registro: null })}>Cadastrar tipo</Button>}
        />
      ) : (
        <Tabela colunas={['NOME', 'COMPONENTE', 'DESCRIÇÃO', '']}>
          {filtrados.map((t) => (
            <tr key={t.id}>
              <td className="px-5 py-3.5 font-semibold text-stone-800">{t.nome}</td>
              <td className="px-5 py-3.5 text-stone-500">{t.componente}</td>
              <td className="px-5 py-3.5 text-stone-500">{t.descricao}</td>
              <td className="px-5 py-3.5 text-right">
                <AcoesDoCatalogo item={t} onEditar={() => setModal({ registro: t })} onExcluir={() => setExcluindo(t)} />
              </td>
            </tr>
          ))}
        </Tabela>
      )}

      {modal && <TipoManutencaoModal registro={modal.registro} onClose={() => setModal(null)} onSalvo={recarregar} />}
      {excluindo && (
        <ConfirmarExclusaoModal
          onClose={() => setExcluindo(null)}
          titulo="Excluir tipo de manutenção"
          descricao={`Excluir "${excluindo.nome}"? Não dá para excluir um item que já tenha OS lançada ou intervalo cadastrado.`}
          onConfirmar={async () => {
            await tipoManutencaoService.remover(excluindo.id)
            recarregar()
          }}
        />
      )}
    </>
  )
}
