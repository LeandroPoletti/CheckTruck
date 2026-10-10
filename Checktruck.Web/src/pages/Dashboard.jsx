import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, PageHeader, Carregando, ErroCarregamento } from '../components/Layout'
import { StatusBadge, PlacaBadge } from '../components/ui/Badges'
import { Button } from '../components/ui/Form'
import { formatKm, nomeDoModelo, textoDias } from '../data/domain'
import { dashboardService } from '../services'
import { obterUsuario } from '../services/sessao'
import { pode, ehAutonomo } from '../data/acesso'
import NovoVeiculoModal from '../components/modals/NovoVeiculoModal'
import UsuarioModal from '../components/modals/UsuarioModal'
import MecanicoModal from '../components/modals/MecanicoModal'

const LIMITE_ALERTAS = 5

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
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)
  const [novoVeiculoOpen, setNovoVeiculoOpen] = useState(false)
  const [novoAcessoOpen, setNovoAcessoOpen] = useState(false)
  const [novoMecanicoOpen, setNovoMecanicoOpen] = useState(false)

  // A API já devolve a situação da frota calculada: contagens, alertas e frota por geração
  useEffect(() => {
    let cancelado = false
    dashboardService.obter(LIMITE_ALERTAS)
      .then((d) => { if (!cancelado) setDados(d) })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [versao])

  // Após salvar: atualiza em segundo plano, sem desmontar a tela (e os modais abertos)
  function recarregar() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  function tentarNovamente() {
    setCarregando(true)
    recarregar()
  }

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  const { frotaAtiva, contagem, alertas, frotaPorGeracao, margemAlertaKm } = dados

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`${frotaAtiva} veículos ativos · atualizado agora`}
      />

      <div className="grid grid-cols-4 gap-4">
        <Card className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-stone-400">FROTA ATIVA</p>
          <p className="mt-1 text-3xl font-bold text-stone-900">{frotaAtiva}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-stone-400">OK</p>
          <p className="mt-1 text-3xl font-bold text-brand-700">{contagem.ok}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-stone-400">ATENÇÃO</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{contagem.atencao}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-stone-400">CRÍTICO</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{contagem.critico}</p>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
          <h3 className="mb-4 font-semibold text-stone-900">Alertas de manutenção</h3>
          {alertas.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">Nenhum alerta ativo. Frota em dia.</p>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => {
                const pct = Math.max(2, alerta.percentualUsado)
                return (
                  <button
                    key={alerta.veiculoId}
                    onClick={() => navigate(`/veiculos/${alerta.veiculoId}`)}
                    className="block w-full text-left"
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
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-stone-800">{alerta.tipoNome}</span>
                      <span className="text-stone-500">
                        {formatKm(alerta.kmAtual)} / {formatKm(alerta.kmProximaTroca)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full ${alerta.status === 'critico' ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={`mt-1 text-xs ${alerta.status === 'critico' ? 'text-red-600' : 'text-amber-600'}`}>
                      {textoDoAlerta(alerta, margemAlertaKm)}
                    </p>
                  </button>
                )
              })}
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

// O alerta pode ser por km ou por data (vence o que chegar primeiro): mostra os dois
function textoDoAlerta(alerta, margemAlertaKm) {
  const { kmRestante, diasRestantes } = alerta
  const km = kmRestante <= 0
    ? `Vencido há ${formatKm(-kmRestante)}`
    : `Faltam ${formatKm(kmRestante)}${kmRestante <= margemAlertaKm ? ` · dentro da margem de ${formatKm(margemAlertaKm)}` : ''}`
  return diasRestantes === null ? km : `${km} · ${textoDias(diasRestantes)}`
}
