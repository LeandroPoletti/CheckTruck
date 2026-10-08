import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca } from '../components/ui/Form'
import PaisModal from '../components/modals/PaisModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import AcoesLinha from '../components/ui/AcoesLinha'
import { paisService } from '../services'
import { contemBusca } from '../data/domain'

export default function Paises() {
  const [paises, setPaises] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // { registro } ao cadastrar/editar
  const [excluindo, setExcluindo] = useState(null)

  useEffect(() => {
    let cancelado = false
    paisService.listar()
      .then((lista) => { if (!cancelado) setPaises(lista) })
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
    return paises
      .filter((p) => contemBusca(p.nome, busca))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [paises, busca])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

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
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
                <th className="px-5 py-3">NOME</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3.5 font-semibold text-stone-800">{p.nome}</td>
                  <td className="px-5 py-3.5 text-right">
                    <AcoesLinha onEditar={() => setModal({ registro: p })} onExcluir={() => setExcluindo(p)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <PaisModal open={!!modal} registro={modal?.registro} onClose={() => setModal(null)} onSalvo={recarregar} />
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir país"
        descricao={`Excluir "${excluindo?.nome}"? Não é possível excluir um país que tenha fabricantes.`}
        onConfirmar={async () => {
          await paisService.remover(excluindo.id)
          recarregar()
        }}
      />
    </>
  )
}
