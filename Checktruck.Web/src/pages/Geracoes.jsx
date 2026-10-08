import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca, Select } from '../components/ui/Form'
import AcoesLinha from '../components/ui/AcoesLinha'
import GeracaoModal from '../components/modals/GeracaoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { geracaoService } from '../services'
import { contemBusca, nomeDoModelo, ordemDasGeracoes, agruparPorModelo } from '../data/domain'

// Gerações = épocas de cada modelo no Brasil (anos, norma, motor, câmbio) com as potências.
export default function Geracoes() {
  const [geracoes, setGeracoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [busca, setBusca] = useState('')
  const [modeloFiltro, setModeloFiltro] = useState('todos')
  const [modal, setModal] = useState(null) // { registro } (null ao cadastrar) enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  // As gerações já trazem fabricante, modelo e potências
  useEffect(() => {
    let cancelado = false
    geracaoService.listar()
      .then((lista) => { if (!cancelado) setGeracoes(lista.sort(ordemDasGeracoes)) })
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

  // Filtro por modelo ("Volvo FH"), na ordem de fabricante e modelo
  const modelos = useMemo(() => agruparPorModelo(geracoes).map(([nome, lista]) => ({ id: lista[0].modeloId, nome })), [geracoes])

  const filtradas = useMemo(() => {
    return geracoes
      .filter((g) => modeloFiltro === 'todos' || g.modeloId === modeloFiltro)
      .filter((g) => contemBusca(
        `${nomeDoModelo(g)} ${g.nome} ${g.motor} ${g.cambio} ${g.normaNome} ${g.potencias.map((p) => p.cv).join(' ')}`,
        busca,
      ))
  }, [geracoes, busca, modeloFiltro])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Gerações"
        subtitle={`${geracoes.length} cadastrada${geracoes.length === 1 ? '' : 's'} · anos, norma, motor, câmbio e potências de cada modelo`}
        action={<Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Nova geração</Button>}
      />

      <div className="mb-5 flex gap-3">
        <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por nome, motor, câmbio, norma ou potência" className="flex-1" />
        <Select value={modeloFiltro} onChange={(e) => setModeloFiltro(e.target.value)} className="w-56">
          <option value="todos">Modelo: todos</option>
          {modelos.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
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
                <th className="px-5 py-3">GERAÇÃO</th>
                <th className="px-5 py-3">MODELO</th>
                <th className="px-5 py-3">ANOS</th>
                <th className="px-5 py-3">NORMA</th>
                <th className="px-5 py-3">MOTOR · CÂMBIO</th>
                <th className="px-5 py-3">POTÊNCIAS (CV)</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtradas.map((g) => (
                <tr key={g.id} className="border-b border-stone-100 align-top last:border-0">
                  <td className="px-5 py-3.5 font-semibold text-stone-800">{g.nome}</td>
                  <td className="px-5 py-3.5 text-stone-500">{nomeDoModelo(g)}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-stone-500">{g.periodo}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-stone-500">{g.normaNome}</td>
                  <td className="px-5 py-3.5 text-stone-500">
                    {g.motor || '—'}
                    {g.cambio && <span className="block text-xs text-stone-400">{g.cambio}</span>}
                  </td>
                  <td className="px-5 py-3.5 text-stone-700">{g.potencias.map((p) => p.cv).join(' · ')}</td>
                  <td className="px-5 py-3.5 text-right">
                    <AcoesLinha onEditar={() => setModal({ registro: g })} onExcluir={() => setExcluindo(g)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {modal && <GeracaoModal registro={modal.registro} onClose={() => setModal(null)} onSalvo={recarregar} />}
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir geração"
        descricao={`Excluir "${excluindo && nomeDoModelo(excluindo)} · ${excluindo?.nome}" e as potências dela? Não é possível excluir uma geração com caminhão ou intervalo cadastrado.`}
        onConfirmar={async () => {
          await geracaoService.remover(excluindo.id)
          recarregar()
        }}
      />
    </>
  )
}
