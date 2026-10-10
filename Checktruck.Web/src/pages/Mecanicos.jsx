import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca } from '../components/ui/Form'
import MecanicoModal from '../components/modals/MecanicoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import AcoesLinha from '../components/ui/AcoesLinha'
import { mecanicoService } from '../services'
import { obterUsuario } from '../services/sessao'
import { ehAutonomo } from '../data/acesso'
import { contemBusca } from '../data/domain'

// Quem faz as trocas nas OS. No Autônomo: as oficinas e os mecânicos onde ele leva o caminhão.
export default function Mecanicos() {
  const autonomo = ehAutonomo(obterUsuario())
  const [mecanicos, setMecanicos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null) // { registro } ao cadastrar/editar
  const [excluindo, setExcluindo] = useState(null)

  useEffect(() => {
    let cancelado = false
    mecanicoService.listar()
      .then((lista) => { if (!cancelado) setMecanicos(lista) })
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

  // Ativos primeiro, depois por nome
  const filtrados = useMemo(() => {
    return mecanicos
      .filter((m) => contemBusca(`${m.nome} ${m.funcao}`, busca))
      .sort((a, b) => (a.ativo === b.ativo ? a.nome.localeCompare(b.nome) : a.ativo ? -1 : 1))
  }, [mecanicos, busca])

  const ativos = mecanicos.filter((m) => m.ativo).length

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title={autonomo ? 'Oficinas e mecânicos' : 'Mecânicos'}
        subtitle={`${ativos} ativo${ativos === 1 ? '' : 's'} · ${autonomo ? 'onde e com quem você faz as trocas' : 'quem faz as trocas nas OS'}`}
        action={<Button onClick={() => setModal({ registro: null })}><Plus size={16} /> {autonomo ? 'Cadastrar' : 'Novo mecânico'}</Button>}
      />

      <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por nome ou função" className="mb-5" />

      {filtrados.length === 0 ? (
        <EmptyState
          title={mecanicos.length === 0
            ? (autonomo ? 'Nenhuma oficina ou mecânico cadastrado' : 'Nenhum mecânico cadastrado')
            : 'Nada encontrado'}
          action={mecanicos.length === 0 && (
            <Button onClick={() => setModal({ registro: null })}>{autonomo ? 'Cadastrar oficina ou mecânico' : 'Cadastrar mecânico'}</Button>
          )}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
                <th className="px-5 py-3">NOME</th>
                <th className="px-5 py-3">FUNÇÃO</th>
                <th className="px-5 py-3">SITUAÇÃO</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m) => (
                <tr key={m.id} className="border-b border-stone-100 last:border-0">
                  <td className={`px-5 py-3.5 font-semibold ${m.ativo ? 'text-stone-800' : 'text-stone-400'}`}>{m.nome}</td>
                  <td className="px-5 py-3.5 text-stone-600">{m.funcao}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        m.ativo ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-stone-300 bg-stone-50 text-stone-500'
                      }`}
                    >
                      {m.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <AcoesLinha onEditar={() => setModal({ registro: m })} onExcluir={() => setExcluindo(m)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <MecanicoModal open={!!modal} registro={modal?.registro} onClose={() => setModal(null)} onSalvo={recarregar} />
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir mecânico"
        descricao={`Excluir "${excluindo?.nome}"? Se ele já tiver OS lançadas, desative o cadastro em vez de excluir.`}
        onConfirmar={async () => {
          await mecanicoService.remover(excluindo.id)
          recarregar()
        }}
      />
    </>
  )
}
