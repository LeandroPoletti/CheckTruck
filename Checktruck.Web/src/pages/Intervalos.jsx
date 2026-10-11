import { useState } from 'react'
import { PageHeader, Abas, Carregando, ErroCarregamento } from '../components/Layout'
import { Select } from '../components/ui/Form'
import IntervalosDaGeracao from '../components/intervalos/IntervalosDaGeracao'
import IntervalosDoCaminhao from '../components/intervalos/IntervalosDoCaminhao'
import { geracaoService, tipoManutencaoService, intervaloVeiculoService } from '../services'
import { useCarga } from '../hooks/useCarga'
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
  const { dados, carregando, erro, tentarNovamente } = useCarga(() =>
    Promise.all([geracaoService.listar(), intervaloVeiculoService.listarVeiculos(), tipoManutencaoService.listar()])
      .then(([geracoes, veiculos, tipos]) => {
        geracoes.sort(ordemDasGeracoes)
        tipos.sort((a, b) => a.componenteId - b.componenteId || a.nome.localeCompare(b.nome))
        return { geracoes, veiculos, tipos }
      }))

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  const { geracoes, veiculos, tipos } = dados
  const componentes = [...new Set(tipos.map((t) => t.componente))]
  const tiposDoFiltro = tipos.filter((t) => componente === 'todos' || t.componente === componente)

  return (
    <>
      <PageHeader
        title="Intervalos de troca"
        subtitle="Vale o primeiro que existir: do caminhão → da empresa → de fábrica → padrão do sistema. Vence o que chegar primeiro: km ou prazo."
      />

      <Abas abas={ABAS.filter((a) => !(a.daEmpresa && dono))} atual={aba} onTrocar={setAba}>
        <Select value={componente} onChange={(e) => setComponente(e.target.value)} className="mb-2 w-52">
          <option value="todos">Componente: todos</option>
          {componentes.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </Abas>

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
