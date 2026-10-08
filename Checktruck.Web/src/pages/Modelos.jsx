import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, CampoBusca, Select } from '../components/ui/Form'
import AcoesLinha from '../components/ui/AcoesLinha'
import ModeloModal from '../components/modals/ModeloModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { modeloService, geracaoService } from '../services'
import { contemBusca } from '../data/domain'

const VAZIO = { modelos: [], geracoes: [] }

export default function Modelos() {
  const [dados, setDados] = useState(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [busca, setBusca] = useState('')
  const [geracaoFiltro, setGeracaoFiltro] = useState('todas')
  const [modal, setModal] = useState(null) // { registro } ao cadastrar/editar
  const [excluindo, setExcluindo] = useState(null)

  // Modelos + gerações (filtro e nome do fabricante de cada modelo)
  useEffect(() => {
    let cancelado = false
    Promise.all([modeloService.listar(), geracaoService.listar()])
      .then(([modelos, geracoes]) => { if (!cancelado) setDados({ modelos, geracoes }) })
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

  const { modelos, geracoes } = dados

  const filtrados = useMemo(() => {
    return modelos
      .filter((m) => geracaoFiltro === 'todas' || m.geracaoId === geracaoFiltro)
      .filter((m) => contemBusca(`${m.nome} ${m.geracaoNome ?? ''}`, busca))
      .sort((a, b) => (a.geracaoNome ?? '').localeCompare(b.geracaoNome ?? '') || a.nome.localeCompare(b.nome))
  }, [modelos, busca, geracaoFiltro])

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  const fabricanteDaGeracao = (geracaoId) => geracoes.find((g) => g.id === geracaoId)?.fabricanteNome

  return (
    <>
      <PageHeader
        title="Modelos"
        subtitle={`${modelos.length} cadastrado${modelos.length === 1 ? '' : 's'} · o modelo define os intervalos recomendados`}
        action={<Button onClick={() => setModal({ registro: null })}><Plus size={16} /> Novo modelo</Button>}
      />

      <div className="mb-5 flex gap-3">
        <CampoBusca value={busca} onChange={setBusca} placeholder="Buscar por nome ou geração" className="flex-1" />
        <Select value={geracaoFiltro} onChange={(e) => setGeracaoFiltro(e.target.value)} className="w-64">
          <option value="todas">Geração: todas</option>
          {geracoes.map((g) => (
            <option key={g.id} value={g.id}>{g.nome} · {g.fabricanteNome}</option>
          ))}
        </Select>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          title={modelos.length === 0 ? 'Nenhum modelo cadastrado' : 'Nenhum modelo encontrado'}
          action={modelos.length === 0 && <Button onClick={() => setModal({ registro: null })}>Cadastrar modelo</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
                <th className="px-5 py-3">NOME</th>
                <th className="px-5 py-3">GERAÇÃO</th>
                <th className="px-5 py-3">POTÊNCIA</th>
                <th className="px-5 py-3">EIXO DIANT.</th>
                <th className="px-5 py-3">TANDEM TRAS.</th>
                <th className="px-5 py-3">PNEUS/EIXO TRAS.</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m) => (
                <tr key={m.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3.5 font-semibold text-stone-800">{m.nome}</td>
                  <td className="px-5 py-3.5 text-stone-500">
                    {m.geracaoNome ?? '—'}
                    <span className="block text-xs text-stone-400">{fabricanteDaGeracao(m.geracaoId)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-stone-700">{m.potenciaCv} cv</td>
                  <td className="px-5 py-3.5 text-stone-500">{m.eixoDianteiroPneus} pneus</td>
                  <td className="px-5 py-3.5 text-stone-500">{m.eixoTraseiroTandem > 0 ? `${m.eixoTraseiroTandem} eixos` : 'Não'}</td>
                  <td className="px-5 py-3.5 text-stone-500">{m.pneusPorEixoTraseiro}</td>
                  <td className="px-5 py-3.5 text-right">
                    <AcoesLinha onEditar={() => setModal({ registro: m })} onExcluir={() => setExcluindo(m)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ModeloModal open={!!modal} registro={modal?.registro} onClose={() => setModal(null)} onSalvo={recarregar} />
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir modelo"
        descricao={`Excluir "${excluindo?.nome}"? Não é possível excluir um modelo com veículos ou intervalos recomendados.`}
        onConfirmar={async () => {
          await modeloService.remover(excluindo.id)
          recarregar()
        }}
      />
    </>
  )
}
