import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Tabela, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca, Select } from '../components/ui/Form'
import { AcoesDoCatalogo } from '../components/ui/AcoesLinha'
import GeracaoModal from '../components/modals/GeracaoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { geracaoService } from '../services'
import { useCarga } from '../hooks/useCarga'
import { contemBusca, nomeDoModelo, ordemDasGeracoes, agruparPorModelo } from '../data/domain'

// Gerações = épocas de cada modelo no Brasil (anos, norma, motor, câmbio) com as potências.
export default function Geracoes() {
  // As gerações já trazem fabricante, modelo e potências
  const { dados: geracoes = [], carregando, erro, recarregar, tentarNovamente } =
    useCarga(() => geracaoService.listar().then((lista) => lista.sort(ordemDasGeracoes)))
  const [busca, setBusca] = useState('')
  const [modeloFiltro, setModeloFiltro] = useState('todos')
  const [modal, setModal] = useState(null) // { registro } (null ao cadastrar) enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

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
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

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
        <Tabela colunas={['GERAÇÃO', 'MODELO', 'ANOS', 'NORMA', 'MOTOR · CÂMBIO', 'POTÊNCIAS (CV)', '']}>
          {filtradas.map((g) => (
            <tr key={g.id} className="align-top">
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
                <AcoesDoCatalogo item={g} onEditar={() => setModal({ registro: g })} onExcluir={() => setExcluindo(g)} />
              </td>
            </tr>
          ))}
        </Tabela>
      )}

      {modal && <GeracaoModal registro={modal.registro} onClose={() => setModal(null)} onSalvo={recarregar} />}
      {excluindo && (
        <ConfirmarExclusaoModal
          onClose={() => setExcluindo(null)}
          titulo="Excluir geração"
          descricao={`Excluir "${nomeDoModelo(excluindo)} · ${excluindo.nome}" e as potências dela? Não é possível excluir uma geração com caminhão ou intervalo cadastrado.`}
          onConfirmar={async () => {
            await geracaoService.remover(excluindo.id)
            recarregar()
          }}
        />
      )}
    </>
  )
}
