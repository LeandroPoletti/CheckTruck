import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Tabela, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca, Select } from '../components/ui/Form'
import { AcoesDoCatalogo } from '../components/ui/AcoesLinha'
import ModeloModal from '../components/modals/ModeloModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { modeloService, fabricanteService, geracaoService } from '../services'
import { useCarga } from '../hooks/useCarga'
import { contemBusca } from '../data/domain'

const VAZIO = { modelos: [], fabricantes: [], geracoes: [] }

// Modelos = linhas de cada fabricante (FH, FM, R, Actros...). As épocas ficam em Gerações.
export default function Modelos() {
  // Modelos (já trazem o fabricante) + fabricantes para o filtro + gerações para a contagem
  const { dados = VAZIO, carregando, erro, recarregar, tentarNovamente } = useCarga(() =>
    Promise.all([modeloService.listar(), fabricanteService.listar(), geracaoService.listar()])
      .then(([modelos, fabricantes, geracoes]) => ({ modelos, fabricantes, geracoes })))
  const [busca, setBusca] = useState('')
  const [fabricanteFiltro, setFabricanteFiltro] = useState('todos')
  const [modal, setModal] = useState(null) // { registro } (null ao cadastrar) enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  const { modelos, fabricantes, geracoes } = dados

  const filtrados = useMemo(() => {
    return modelos
      .filter((m) => fabricanteFiltro === 'todos' || m.fabricanteId === fabricanteFiltro)
      .filter((m) => contemBusca(`${m.fabricanteNome} ${m.nome}`, busca))
      .sort((a, b) => a.fabricanteNome.localeCompare(b.fabricanteNome) || a.nome.localeCompare(b.nome))
  }, [modelos, busca, fabricanteFiltro])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  const geracoesDoModelo = (modeloId) => geracoes.filter((g) => g.modeloId === modeloId)

  return (
    <>
      <PageHeader
        title="Modelos"
        subtitle={`${modelos.length} cadastrado${modelos.length === 1 ? '' : 's'} · a linha de cada fabricante (FH, FM, R, Actros...)`}
        action={<Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Novo modelo</Button>}
      />

      <div className="mb-5 flex gap-3">
        <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por modelo ou fabricante" className="flex-1" />
        <Select value={fabricanteFiltro} onChange={(e) => setFabricanteFiltro(e.target.value)} className="w-56">
          <option value="todos">Fabricante: todos</option>
          {fabricantes.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </Select>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          title={modelos.length === 0 ? 'Nenhum modelo cadastrado' : 'Nenhum modelo encontrado'}
          action={modelos.length === 0 && <Button onClick={() => setModal({ registro: null })}>Cadastrar modelo</Button>}
        />
      ) : (
        <Tabela colunas={['Modelo', 'Fabricante', 'Gerações', '']}>
          {filtrados.map((m) => {
            const doModelo = geracoesDoModelo(m.id)
            return (
              <tr key={m.id}>
                <td className="px-5 py-3.5 font-semibold text-stone-800">{m.nome}</td>
                <td className="px-5 py-3.5 text-stone-500">{m.fabricanteNome}</td>
                <td className="px-5 py-3.5 text-stone-700">
                  {doModelo.length}
                  {doModelo.length > 0 && <span className="block text-xs text-stone-400">{doModelo.map((g) => g.nome).join(' · ')}</span>}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <AcoesDoCatalogo item={m} onEditar={() => setModal({ registro: m })} onExcluir={() => setExcluindo(m)} />
                </td>
              </tr>
            )
          })}
        </Tabela>
      )}

      {modal && <ModeloModal registro={modal.registro} onClose={() => setModal(null)} onSalvo={recarregar} />}
      {excluindo && (
        <ConfirmarExclusaoModal
          onClose={() => setExcluindo(null)}
          titulo="Excluir modelo"
          descricao={`Excluir "${excluindo.fabricanteNome} ${excluindo.nome}"? Não é possível excluir um modelo que tenha gerações.`}
          onConfirmar={async () => {
            await modeloService.remover(excluindo.id)
            recarregar()
          }}
        />
      )}
    </>
  )
}
