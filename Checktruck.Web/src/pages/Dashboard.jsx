import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, PageHeader, Carregando, ErroCarregamento } from '../components/Layout'
import { StatusBadge, PlacaBadge } from '../components/ui/Badges'
import { BarraDeUso } from '../components/ui/BarraDeUso'
import { Button } from '../components/ui/Form'
import { formatKm, nomeDoModelo, textoDias } from '../data/domain'
import { dashboardService } from '../services'
import { useCarga } from '../hooks/useCarga'
import { obterUsuario } from '../services/sessao'
import { pode, ehAutonomo } from '../data/acesso'
import NovoVeiculoModal from '../components/modals/NovoVeiculoModal'
import UsuarioModal from '../components/modals/UsuarioModal'
import MecanicoModal from '../components/modals/MecanicoModal'

const LIMITE_ALERTAS = 5
const ITENS = ['item', 'itens']

export default function Dashboard() {
  const navigate = useNavigate()
  const usuario = obterUsuario()
  // Atalhos de cadastro: cada um só para quem tem a permissão dele (o Autônomo tem um acesso só)
  const autonomo = ehAutonomo(usuario)
  const atalhos = {
    veiculo: pode(usuario, 'Veiculos'),
    acesso: usuario.cuidaDosAcessos && !autonomo,
    mecanico: pode(usuario, 'Cadastros'),
  }
  // A API já devolve a situação da frota calculada: contagens, alertas e frota por geração
  const { dados, carregando, erro, recarregar, tentarNovamente } = useCarga(() => dashboardService.obter(LIMITE_ALERTAS))
  const [novoVeiculoOpen, setNovoVeiculoOpen] = useState(false)
  const [novoAcessoOpen, setNovoAcessoOpen] = useState(false)
  const [novoMecanicoOpen, setNovoMecanicoOpen] = useState(false)

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  const { frotaAtiva, contagem, alertas, frotaPorGeracao } = dados

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`${frotaAtiva} veículos ativos · atualizado agora`}
      />

      {/* A frota ativa conta caminhões; OK, Atenção e Crítico contam itens (as trocas acompanhadas) */}
      <div className="grid grid-cols-4 gap-4">
        <Contador titulo="FROTA ATIVA" valor={frotaAtiva} unidade={['caminhão', 'caminhões']} cor="text-stone-900" />
        <Contador titulo="OK" valor={contagem.ok} unidade={ITENS} cor="text-brand-700" />
        <Contador titulo="ATENÇÃO" valor={contagem.atencao} unidade={ITENS} cor="text-amber-600" />
        <Contador titulo="CRÍTICO" valor={contagem.critico} unidade={ITENS} cor="text-red-600" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
          <h3 className="mb-4 font-semibold text-stone-900">Alertas de manutenção</h3>
          {alertas.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">Nenhum alerta ativo. Frota em dia.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {alertas.map((alerta) => (
                <button
                  key={alerta.veiculoId}
                  onClick={() => navigate(`/veiculos/${alerta.veiculoId}`)}
                  className="block w-full py-4 text-left first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlacaBadge placa={alerta.placa} size="sm" />
                      <span className="text-sm text-stone-500">
                        {nomeDoModelo(alerta)} · {alerta.geracaoNome}
                      </span>
                    </div>
                    <StatusBadge status={alerta.status} />
                  </div>
                  <div className="mt-2 space-y-3">
                    {alerta.itens.map((item) => (
                      <div key={item.tipoId}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-stone-800">{item.tipoNome}</span>
                          <span className="text-stone-500">
                            {formatKm(alerta.kmAtual)} / {formatKm(item.kmProximaTroca)}
                          </span>
                        </div>
                        <BarraDeUso percentual={item.percentualUsado} status={item.status} />
                        <p className={`mt-1 text-xs ${item.status === 'critico' ? 'text-red-600' : 'text-amber-600'}`}>
                          {textoDoAlerta(item)}
                        </p>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {(atalhos.veiculo || atalhos.acesso || atalhos.mecanico) && (
            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-stone-900">Cadastros rápidos</h3>
              <div className="space-y-2">
                {atalhos.veiculo && (
                  <Button className="w-full justify-center" onClick={() => setNovoVeiculoOpen(true)}>
                    Novo veículo
                  </Button>
                )}
                {atalhos.acesso && (
                  <Button variant="secondary" className="w-full justify-center" onClick={() => setNovoAcessoOpen(true)}>
                    Novo acesso
                  </Button>
                )}
                {atalhos.mecanico && (
                  <Button variant="secondary" className="w-full justify-center" onClick={() => setNovoMecanicoOpen(true)}>
                    {autonomo ? 'Oficina ou mecânico' : 'Novo mecânico'}
                  </Button>
                )}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h3 className="mb-4 font-semibold text-stone-900">Frota por geração</h3>
            <div className="space-y-3">
              {frotaPorGeracao.map((g) => (
                <div key={g.geracaoId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-700">{nomeDoModelo(g)} · {g.geracaoNome}</span>
                    <span className="font-semibold text-stone-900">{g.quantidade}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${(g.quantidade / (frotaAtiva || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {novoVeiculoOpen && <NovoVeiculoModal onClose={() => setNovoVeiculoOpen(false)} onSalvo={recarregar} />}
      {novoAcessoOpen && <UsuarioModal onClose={() => setNovoAcessoOpen(false)} />}
      <MecanicoModal open={novoMecanicoOpen} onClose={() => setNovoMecanicoOpen(false)} />
    </>
  )
}

// Quadrinho do topo. unidade: [singular, plural], escrita embaixo do número
function Contador({ titulo, valor, unidade, cor }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-xs font-semibold tracking-wide text-stone-400">{titulo}</p>
      <p className={`mt-1 text-3xl font-bold ${cor}`}>{valor}</p>
      <p className="text-xs text-stone-400">{valor === 1 ? unidade[0] : unidade[1]}</p>
    </Card>
  )
}

// O item pode estar em alerta por km ou por data (vence o que chegar primeiro): mostra os dois
function textoDoAlerta(item) {
  const { kmRestante, diasRestantes, margemAlertaKm } = item
  const km = kmRestante <= 0
    ? `Vencido há ${formatKm(-kmRestante)}`
    : `Faltam ${formatKm(kmRestante)}${kmRestante <= margemAlertaKm ? ` · dentro da margem de ${formatKm(margemAlertaKm)}` : ''}`
  return diasRestantes === null ? km : `${km} · ${textoDias(diasRestantes)}`
}
