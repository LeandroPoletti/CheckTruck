import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca } from '../components/ui/Form'
import { AcoesDoCatalogo } from '../components/ui/AcoesLinha'
import FabricanteModal from '../components/modals/FabricanteModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { fabricanteService } from '../services'
import { contemBusca } from '../data/domain'

export default function Fabricantes() {
  const [fabricantes, setFabricantes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // { registro } ao cadastrar/editar
  const [excluindo, setExcluindo] = useState(null)

  // O DTO do fabricante já traz o país, então basta uma request
  useEffect(() => {
    let cancelado = false
    fabricanteService.listar()
      .then((lista) => { if (!cancelado) setFabricantes(lista) })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [versao])

  // Após salvar/excluir: atualiza em segundo plano, sem desmontar a tela
  function recarregar() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  function tentarNovamente() {
    setCarregando(true)
    recarregar()
  }

  const filtrados = useMemo(() => {
    return fabricantes
      .filter((f) => contemBusca(`${f.nome} ${f.pais ?? ''}`, busca))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [fabricantes, busca])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

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
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
                <th className="px-5 py-3">NOME</th>
                <th className="px-5 py-3">PAÍS DE ORIGEM</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((f) => (
                <tr key={f.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3.5 font-semibold text-stone-800">{f.nome}</td>
                  <td className="px-5 py-3.5 text-stone-500">{f.pais ?? '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <AcoesDoCatalogo item={f} onEditar={() => setModal({ registro: f })} onExcluir={() => setExcluindo(f)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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
