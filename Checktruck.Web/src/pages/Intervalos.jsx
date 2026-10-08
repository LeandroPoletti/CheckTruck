import { useEffect, useState } from 'react'
import { PageHeader, Carregando, ErroCarregamento } from '../components/Layout'
import { Select } from '../components/ui/Form'
import IntervalosDoModelo from '../components/intervalos/IntervalosDoModelo'
import IntervalosDoCaminhao from '../components/intervalos/IntervalosDoCaminhao'
import { modeloService, geracaoService, tipoManutencaoService, intervaloVeiculoService } from '../services'

const ABAS = [
  { id: 'modelo', label: 'Por modelo' },
  { id: 'caminhao', label: 'Por caminhão' },
]

// Intervalos de troca. Vale o primeiro que existir: do caminhão → do modelo → padrão do sistema.
// O modelo e o caminhão escolhidos ficam aqui para não se perderem ao trocar de aba.
export default function Intervalos() {
  const [aba, setAba] = useState('modelo')
  const [componente, setComponente] = useState('todos')
  const [modeloId, setModeloId] = useState(null)
  const [veiculoId, setVeiculoId] = useState(null)

  // Listas fixas da página: modelos (e gerações, para o rótulo), caminhões ativos e tipos de manutenção
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let cancelado = false
    Promise.all([modeloService.listar(), geracaoService.listar(), intervaloVeiculoService.listarVeiculos(), tipoManutencaoService.listar()])
      .then(([modelos, geracoes, veiculos, tipos]) => {
        if (cancelado) return
        modelos.sort((a, b) => a.nome.localeCompare(b.nome))
        tipos.sort((a, b) => a.componenteId - b.componenteId || a.nome.localeCompare(b.nome))
        setDados({ modelos, geracoes, veiculos, tipos })
      })
      .catch((e) => { if (!cancelado) setErro(e.message) })
    return () => { cancelado = true }
  }, [versao])

  function tentarNovamente() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />
  if (!dados) return <Carregando />

  const { modelos, geracoes, veiculos, tipos } = dados
  const componentes = [...new Set(tipos.map((t) => t.componente))]
  const tiposDoFiltro = tipos.filter((t) => componente === 'todos' || t.componente === componente)

  return (
    <>
      <PageHeader
        title="Intervalos de troca"
        subtitle="Vale o primeiro que existir: do caminhão → do modelo → padrão do sistema. Vence o que chegar primeiro: km ou prazo."
      />

      <div className="mb-5 flex items-end justify-between gap-4 border-b border-stone-200">
        <div className="flex gap-6">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold transition ${
                aba === a.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <Select value={componente} onChange={(e) => setComponente(e.target.value)} className="mb-2 w-52">
          <option value="todos">Componente: todos</option>
          {componentes.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {aba === 'modelo' ? (
        <IntervalosDoModelo
          modelos={modelos}
          geracoes={geracoes}
          tipos={tiposDoFiltro}
          modeloId={modeloId ?? modelos[0]?.id}
          onModelo={setModeloId}
        />
      ) : (
        <IntervalosDoCaminhao
          veiculos={veiculos}
          tipos={tiposDoFiltro}
          veiculoId={veiculoId ?? veiculos[0]?.id}
          onVeiculo={setVeiculoId}
        />
      )}
    </>
  )
}
