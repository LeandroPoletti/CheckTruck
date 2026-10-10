import { useEffect, useState } from 'react'
import { PageHeader, Carregando, ErroCarregamento } from '../components/Layout'
import { Select } from '../components/ui/Form'
import IntervalosDaGeracao from '../components/intervalos/IntervalosDaGeracao'
import IntervalosDoCaminhao from '../components/intervalos/IntervalosDoCaminhao'
import { geracaoService, tipoManutencaoService, intervaloVeiculoService } from '../services'
import { obterUsuario } from '../services/sessao'
import { ehDonoDoSistema } from '../data/acesso'
import { ordemDasGeracoes } from '../data/domain'

// O dono do sistema não é de nenhuma empresa: não tem caminhão, só a aba da geração
const ABAS = [
  { id: 'geracao', label: 'Por geração' },
  { id: 'caminhao', label: 'Por caminhão', daEmpresa: true },
]

// Intervalos de troca. Vale o primeiro que existir: do caminhão → da empresa → de fábrica → padrão do sistema.
// A geração e o caminhão escolhidos ficam aqui para não se perderem ao trocar de aba.
// Sem escolha, abre na geração do primeiro caminhão da frota.
export default function Intervalos() {
  const dono = ehDonoDoSistema(obterUsuario())
  const [aba, setAba] = useState('geracao')
  const [componente, setComponente] = useState('todos')
  const [geracaoId, setGeracaoId] = useState(null)
  const [veiculoId, setVeiculoId] = useState(null)

  // Listas fixas da página: gerações (com fabricante e modelo), caminhões ativos e tipos de manutenção
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let cancelado = false
    Promise.all([geracaoService.listar(), intervaloVeiculoService.listarVeiculos(), tipoManutencaoService.listar()])
      .then(([geracoes, veiculos, tipos]) => {
        if (cancelado) return
        geracoes.sort(ordemDasGeracoes)
        tipos.sort((a, b) => a.componenteId - b.componenteId || a.nome.localeCompare(b.nome))
        setDados({ geracoes, veiculos, tipos })
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

  const { geracoes, veiculos, tipos } = dados
  const componentes = [...new Set(tipos.map((t) => t.componente))]
  const tiposDoFiltro = tipos.filter((t) => componente === 'todos' || t.componente === componente)

  return (
    <>
      <PageHeader
        title="Intervalos de troca"
        subtitle="Vale o primeiro que existir: do caminhão → da empresa → de fábrica → padrão do sistema. Vence o que chegar primeiro: km ou prazo."
      />

      <div className="mb-5 flex items-end justify-between gap-4 border-b border-stone-200">
        <div className="flex gap-6">
          {ABAS.filter((a) => !(a.daEmpresa && dono)).map((a) => (
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

      {aba === 'geracao' ? (
        <IntervalosDaGeracao
          geracoes={geracoes}
          tipos={tiposDoFiltro}
          geracaoId={geracaoId ?? veiculos[0]?.geracaoId ?? geracoes[0]?.id}
          onGeracao={setGeracaoId}
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
