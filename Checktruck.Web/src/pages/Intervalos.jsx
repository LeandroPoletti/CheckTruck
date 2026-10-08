import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, Carregando, ErroCarregamento } from '../components/Layout'
import { Button, Select } from '../components/ui/Form'
import AcoesLinha from '../components/ui/AcoesLinha'
import IntervaloModal from '../components/modals/IntervaloModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { formatKm } from '../data/domain'
import { modeloService, geracaoService, tipoManutencaoService, intervaloService, filtro } from '../services'

const VAZIO = { modelos: [], geracoes: [], tiposManutencao: [] }

export default function Intervalos() {
  const [selecionadoId, setModeloId] = useState(null)
  const [componente, setComponente] = useState('todos')

  // Listas fixas da página: modelos (seletor), gerações (rótulos) e tipos (colunas/filtro)
  const [dados, setDados] = useState(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let cancelado = false
    Promise.all([modeloService.listar(), geracaoService.listar(), tipoManutencaoService.listar()])
      .then(([modelos, geracoes, tiposManutencao]) => {
        if (!cancelado) setDados({ modelos, geracoes, tiposManutencao })
      })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [versao])

  function tentarNovamente() {
    setCarregando(true)
    setErro(null)
    setVersao((v) => v + 1)
  }

  const { modelos, geracoes, tiposManutencao } = dados
  const modeloId = selecionadoId ?? modelos[0]?.id

  // Intervalos só do modelo selecionado ($filter=Modelo/Id eq X), recarregados ao trocar o modelo e depois de salvar
  const [intervalos, setIntervalos] = useState([])
  const [carregandoIntervalos, setCarregandoIntervalos] = useState(false)
  const [erroIntervalos, setErroIntervalos] = useState(null)
  const [versaoIntervalos, setVersaoIntervalos] = useState(0)
  const [modal, setModal] = useState(null) // { intervalo } (null ao criar) enquanto o modal está aberto
  const [excluindo, setExcluindo] = useState(null)

  useEffect(() => {
    if (!modeloId) return
    let cancelado = false
    setCarregandoIntervalos(true)
    setErroIntervalos(null)
    intervaloService.listar(filtro.porId('Modelo', modeloId))
      .then((lista) => { if (!cancelado) setIntervalos(lista) })
      .catch((e) => { if (!cancelado) setErroIntervalos(e.message) })
      .finally(() => { if (!cancelado) setCarregandoIntervalos(false) })
    return () => { cancelado = true }
  }, [modeloId, versaoIntervalos])

  const recarregarIntervalos = () => setVersaoIntervalos((v) => v + 1)

  const linhas = useMemo(() => {
    return intervalos
      .filter((it) => componente === 'todos' || tiposManutencao.find((t) => t.id === it.tipoId)?.componente === componente)
      .map((it) => ({ ...it, tipo: tiposManutencao.find((t) => t.id === it.tipoId) }))
  }, [intervalos, componente, tiposManutencao])

  const componentes = [...new Set(tiposManutencao.map((t) => t.componente))]
  const modelo = modelos.find((m) => m.id === modeloId)
  // Um intervalo por modelo e tipo: no "+ Intervalo" só aparecem os tipos que ainda não têm
  const tiposSemIntervalo = tiposManutencao.filter((t) => !intervalos.some((it) => it.tipoId === t.id))
  const nomeDoTipo = (tipoId) => tiposManutencao.find((t) => t.id === tipoId)?.nome ?? ''

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Intervalos recomendados"
        subtitle="Um intervalo por modelo e tipo de manutenção · seed oficial Volvo e Meritor"
        action={
          <Button
            onClick={() => setModal({ intervalo: null })}
            disabled={!modelo || carregandoIntervalos || tiposSemIntervalo.length === 0}
            title={tiposSemIntervalo.length === 0 ? 'Todos os tipos já têm intervalo neste modelo' : undefined}
          >
            <Plus size={16} /> Intervalo
          </Button>
        }
      />

      <div className="mb-5 flex gap-3">
        <Select value={modeloId ?? ''} onChange={(e) => setModeloId(e.target.value)} className="w-64">
          {modelos.map((m) => {
            const g = geracoes.find((gg) => gg.id === m.geracaoId)
            return <option key={m.id} value={m.id}>{m.nome} · {g?.nome}</option>
          })}
        </Select>
        <Select value={componente} onChange={(e) => setComponente(e.target.value)} className="w-48">
          <option value="todos">Componente: todos</option>
          {componentes.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {erroIntervalos && <ErroCarregamento mensagem={erroIntervalos} />}
      {carregandoIntervalos && <p className="mb-3 text-sm text-stone-400">Carregando intervalos do modelo…</p>}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
              <th className="px-5 py-3">TIPO DE MANUTENÇÃO</th>
              <th className="px-5 py-3">COMPONENTE</th>
              <th className="px-5 py-3">INTERVALO</th>
              <th className="px-5 py-3">1ª TROCA</th>
              <th className="px-5 py-3">PRAZO</th>
              <th className="px-5 py-3">FONTE</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {linhas.map((it) => (
              <tr key={it.tipoId} className="border-b border-stone-100 last:border-0">
                <td className="px-5 py-3.5 font-semibold text-stone-800">{it.tipo?.nome}</td>
                <td className="px-5 py-3.5 text-stone-500">{it.tipo?.componente}</td>
                <td className="px-5 py-3.5 text-stone-700">{formatKm(it.intervaloKm)}</td>
                <td className="px-5 py-3.5">
                  {it.intervaloKmPrimeira ? (
                    <span className="font-semibold text-amber-600">{formatKm(it.intervaloKmPrimeira)}</span>
                  ) : (
                    <span className="text-stone-400">igual ao intervalo</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-stone-700">
                  {it.intervaloMeses ? `${it.intervaloMeses} ${it.intervaloMeses === 1 ? 'mês' : 'meses'}` : <span className="text-stone-400">só por km</span>}
                </td>
                <td className="px-5 py-3.5 text-stone-500">{it.fonte}</td>
                <td className="px-5 py-3.5 text-right">
                  <AcoesLinha onEditar={() => setModal({ intervalo: it })} onExcluir={() => setExcluindo(it)} />
                </td>
              </tr>
            ))}
            {!carregandoIntervalos && linhas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-stone-400">
                  {intervalos.length === 0
                    ? 'Nenhum intervalo cadastrado neste modelo. Os caminhões dele usam o intervalo próprio (se tiverem) ou o padrão do sistema.'
                    : 'Nenhum intervalo deste componente.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <span className="mr-1 rounded-full bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-700">1ª TROCA</span>
        Quando o registro de manutenção marca primeira troca, o sistema usa o intervalo de
        amaciamento em vez do padrão. Câmbio Gen 4/5 zerômetro: 200.000 km. Diferencial Meritor: 10.000 km.
      </div>

      {modal && (
        <IntervaloModal
          modelo={modelo}
          intervalo={modal.intervalo}
          tipos={tiposSemIntervalo}
          nomeDoTipo={nomeDoTipo}
          onClose={() => setModal(null)}
          onSalvo={recarregarIntervalos}
        />
      )}
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir intervalo"
        descricao={`Excluir o intervalo de "${nomeDoTipo(excluindo?.tipoId)}" do ${modelo?.nome}? Os caminhões deste modelo passam a usar o intervalo próprio (se tiverem) ou o padrão do sistema.`}
        onConfirmar={async () => {
          await intervaloService.remover(excluindo.id)
          recarregarIntervalos()
        }}
      />
    </>
  )
}
