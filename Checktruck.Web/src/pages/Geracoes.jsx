import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca, Select } from '../components/ui/Form'
import AcoesLinha from '../components/ui/AcoesLinha'
import GeracaoModal from '../components/modals/GeracaoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { geracaoService, fabricanteService } from '../services'
import { contemBusca } from '../data/domain'

const VAZIO = { geracoes: [], fabricantes: [] }

export default function Geracoes() {
  const [dados, setDados] = useState(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [busca, setBusca] = useState('')
  const [fabricanteFiltro, setFabricanteFiltro] = useState('todos')
  const [modal, setModal] = useState(null) // { registro } ao cadastrar/editar
  const [excluindo, setExcluindo] = useState(null)

  // Gerações (já trazem o nome do fabricante) + fabricantes para o filtro
  useEffect(() => {
    let cancelado = false
    Promise.all([geracaoService.listar(), fabricanteService.listar()])
      .then(([geracoes, fabricantes]) => { if (!cancelado) setDados({ geracoes, fabricantes }) })
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

  const { geracoes, fabricantes } = dados

  const filtradas = useMemo(() => {
    return geracoes
      .filter((g) => fabricanteFiltro === 'todos' || g.fabricanteId === fabricanteFiltro)
      .filter((g) => contemBusca(`${g.nome} ${g.motor} ${g.cambio} ${g.norma}`, busca))
      .sort((a, b) => (a.fabricanteNome ?? '').localeCompare(b.fabricanteNome ?? '') || (a.anoInicio ?? 0) - (b.anoInicio ?? 0))
  }, [geracoes, busca, fabricanteFiltro])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Gerações"
        subtitle={`${geracoes.length} cadastrada${geracoes.length === 1 ? '' : 's'} · motor, câmbio e norma de cada geração`}
        action={<Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Nova geração</Button>}
      />

      <div className="mb-5 flex gap-3">
        <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por nome, motor, câmbio ou norma" className="flex-1" />
        <Select value={fabricanteFiltro} onChange={(e) => setFabricanteFiltro(e.target.value)} className="w-56">
          <option value="todos">Fabricante: todos</option>
          {fabricantes.map((f) => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </Select>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          title={geracoes.length === 0 ? 'Nenhuma geração cadastrada' : 'Nenhuma geração encontrada'}
          action={geracoes.length === 0 && <Button onClick={() => setModal({ registro: null })}>Cadastrar geração</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
                <th className="px-5 py-3">NOME</th>
                <th className="px-5 py-3">FABRICANTE</th>
                <th className="px-5 py-3">PERÍODO</th>
                <th className="px-5 py-3">MOTOR</th>
                <th className="px-5 py-3">CÂMBIO</th>
                <th className="px-5 py-3">NORMA</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtradas.map((g) => (
                <tr key={g.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3.5 font-semibold text-stone-800">{g.nome}</td>
                  <td className="px-5 py-3.5 text-stone-500">{g.fabricanteNome ?? '—'}</td>
                  <td className="px-5 py-3.5 text-stone-500">{g.periodo}</td>
                  <td className="px-5 py-3.5 text-stone-500">{g.motor || '—'}</td>
                  <td className="px-5 py-3.5 text-stone-500">{g.cambio || '—'}</td>
                  <td className="px-5 py-3.5 text-stone-500">{g.norma || '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <AcoesLinha onEditar={() => setModal({ registro: g })} onExcluir={() => setExcluindo(g)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <GeracaoModal open={!!modal} registro={modal?.registro} onClose={() => setModal(null)} onSalvo={recarregar} />
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir geração"
        descricao={`Excluir "${excluindo?.nome}"? Não é possível excluir uma geração que tenha modelos.`}
        onConfirmar={async () => {
          await geracaoService.remover(excluindo.id)
          recarregar()
        }}
      />
    </>
  )
}
