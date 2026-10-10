import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca } from '../components/ui/Form'
import TipoManutencaoModal from '../components/modals/TipoManutencaoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { AcoesDoCatalogo } from '../components/ui/AcoesLinha'
import { tipoManutencaoService } from '../services'
import { contemBusca } from '../data/domain'

// Itens que o sistema acompanha nos caminhões (óleo do motor, filtro de ar...)
export default function TiposManutencao() {
  const [tipos, setTipos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // { registro } (null ao cadastrar) enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  useEffect(() => {
    let cancelado = false
    tipoManutencaoService.listar()
      .then((lista) => { if (!cancelado) setTipos(lista) })
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
    return tipos
      .filter((t) => contemBusca(`${t.nome} ${t.componente}`, busca))
      .sort((a, b) => a.componenteId - b.componenteId || a.nome.localeCompare(b.nome))
  }, [tipos, busca])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

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
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
                <th className="px-5 py-3">NOME</th>
                <th className="px-5 py-3">COMPONENTE</th>
                <th className="px-5 py-3">DESCRIÇÃO</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((t) => (
                <tr key={t.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3.5 font-semibold text-stone-800">{t.nome}</td>
                  <td className="px-5 py-3.5 text-stone-500">{t.componente}</td>
                  <td className="px-5 py-3.5 text-stone-500">{t.descricao}</td>
                  <td className="px-5 py-3.5 text-right">
                    <AcoesDoCatalogo item={t} onEditar={() => setModal({ registro: t })} onExcluir={() => setExcluindo(t)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {modal && <TipoManutencaoModal registro={modal.registro} onClose={() => setModal(null)} onSalvo={recarregar} />}
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir tipo de manutenção"
        descricao={`Excluir "${excluindo?.nome}"? Não dá para excluir um item que já tenha OS lançada ou intervalo cadastrado.`}
        onConfirmar={async () => {
          await tipoManutencaoService.remover(excluindo.id)
          recarregar()
        }}
      />
    </>
  )
}
