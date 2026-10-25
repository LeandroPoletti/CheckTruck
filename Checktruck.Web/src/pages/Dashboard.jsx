import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card, PageHeader, Carregando, ErroCarregamento } from '../components/Layout'
import { StatusBadge, PlacaBadge } from '../components/ui/Badges'
import { BarraDeUso } from '../components/ui/BarraDeUso'
import { Button } from '../components/ui/Form'
import { formatKm, nomeDoModelo, textoDias } from '../data/domain'
import { dashboardService } from '../services'
import { useCarga } from '../hooks/useCarga'
import { Caminhao } from '../components/marca/Desenhos'
import { obterUsuario } from '../services/sessao'
import { pode } from '../data/acesso'
import NovoVeiculoModal from '../components/modals/NovoVeiculoModal'
import UsuarioModal from '../components/modals/UsuarioModal'
import MecanicoModal from '../components/modals/MecanicoModal'

const LIMITE_ALERTAS = 5

export default function Dashboard() {
  const navigate = useNavigate()
  const usuario = obterUsuario()
  // Atalhos de cadastro: cada um só para quem tem a permissão dele
  const atalhos = {
    veiculo: pode(usuario, 'Veiculos'),
    acesso: usuario.cuidaDosAcessos,
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

      <SituacaoDaFrota frotaAtiva={frotaAtiva} contagem={contagem} />

      <div className="mt-6 grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6">
          <h3 className="mb-4 text-xl font-bold text-stone-900">Alertas de manutenção</h3>
          {alertas.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500">Nenhum alerta ativo. Frota em dia.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {alertas.map((alerta) => (
                <button
                  key={alerta.veiculoId}
                  onClick={() => navigate(`/veiculos/${alerta.veiculoId}`)}
                  className="-mx-3 block w-[calc(100%+1.5rem)] rounded-xl px-3 py-4 text-left transition hover:bg-mist-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlacaBadge placa={alerta.placa} size="sm" />
                      <span className="text-sm text-stone-500">
                        {nomeDoModelo(alerta)} · {alerta.geracaoNome}
                      </span>
                    </div>
                    <StatusBadge status={alerta.status} />
                  </div>
                  <div className="mt-3 space-y-3">
                    {alerta.itens.map((item) => (
                      <div key={item.tipoId}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-stone-800">{item.tipoNome}</span>
                          <span className="text-stone-500">
                            {formatKm(alerta.kmAtual)} / {formatKm(item.kmProximaTroca)}
                          </span>
                        </div>
                        <BarraDeUso percentual={item.percentualUsado} status={item.status} />
                        <p className={`mt-1 text-sm font-medium ${item.status === 'critico' ? 'text-red-600' : 'text-amber-700'}`}>
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
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-bold text-stone-900">Cadastros rápidos</h3>
              <div className="space-y-3">
                {atalhos.veiculo && (
                  <Button className="w-full justify-center" onClick={() => setNovoVeiculoOpen(true)}>
                    <Plus size={18} /> Novo veículo
                  </Button>
                )}
                {atalhos.acesso && (
                  <Button variant="secondary" className="w-full justify-center" onClick={() => setNovoAcessoOpen(true)}>
                    <Plus size={18} /> Novo acesso
                  </Button>
                )}
                {atalhos.mecanico && (
                  <Button variant="secondary" className="w-full justify-center" onClick={() => setNovoMecanicoOpen(true)}>
                    <Plus size={18} /> Novo mecânico
                  </Button>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="mb-4 text-xl font-bold text-stone-900">Frota por geração</h3>
            <div className="space-y-4">
              {frotaPorGeracao.map((g) => (
                <div key={g.geracaoId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-700">{nomeDoModelo(g)} · {g.geracaoNome}</span>
                    <span className="font-semibold text-stone-900">{g.quantidade}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-200/70">
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
      {novoMecanicoOpen && <MecanicoModal onClose={() => setNovoMecanicoOpen(false)} />}
    </>
  )
}

const plural = (n, singular, varios) => `${n} ${n === 1 ? singular : varios}`

// O resumo da frota numa frase ("1 troca vencida e 3 chegando perto"), a faixa com a parte de cada status e os
// números. A frota ativa conta caminhões; OK, Atenção e Crítico contam itens (as trocas acompanhadas).
function SituacaoDaFrota({ frotaAtiva, contagem: { ok, atencao, critico } }) {
  const total = ok + atencao + critico
  return (
    <Card className="flex items-center gap-8 overflow-hidden border-t-[6px] border-t-brand-700 px-7 py-6">
      <div className="flex-1">
        <h2 className="text-[27px] leading-tight font-extrabold text-stone-900">{fraseDaSituacao(total, atencao, critico)}</h2>
        {total > 0 && (
          <p className="mt-1 text-stone-500">
            {total === 1 ? 'De 1 troca acompanhada' : `Das ${total} trocas acompanhadas`}{' '}
            {frotaAtiva === 1 ? 'em 1 caminhão ativo' : `nos ${frotaAtiva} caminhões ativos`}
          </p>
        )}
        {total > 0 && (
          <div className="mt-5 flex h-4 max-w-2xl gap-1">
            {[[ok, 'bg-brand-500'], [atencao, 'bg-amber-500'], [critico, 'bg-red-500']].map(([n, cor]) => (
              n > 0 && <span key={cor} className={`rounded ${cor}`} style={{ flexGrow: n }} />
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-8">
          <Numero valor={frotaAtiva} texto={frotaAtiva === 1 ? 'caminhão ativo' : 'caminhões ativos'} cor="text-stone-900" />
          <Numero valor={ok} texto={ok === 1 ? 'item OK' : 'itens OK'} cor="text-brand-700" />
          <Numero valor={atencao} texto={atencao === 1 ? 'item em atenção' : 'itens em atenção'} cor="text-amber-600" />
          <Numero valor={critico} texto={critico === 1 ? 'item crítico' : 'itens críticos'} cor="text-red-600" />
        </div>
      </div>
      <Caminhao largura={300} className="shrink-0" />
    </Card>
  )
}

function fraseDaSituacao(total, atencao, critico) {
  if (total === 0) return 'Nenhuma troca acompanhada ainda'
  const vencidas = plural(critico, 'troca vencida', 'trocas vencidas')
  if (critico && atencao) return `${vencidas} e ${atencao} chegando perto`
  if (critico) return vencidas
  if (atencao) return `${plural(atencao, 'troca', 'trocas')} chegando perto`
  return 'Todas as trocas em dia'
}

function Numero({ valor, texto, cor }) {
  return (
    <div>
      <p className={`font-titulo text-[30px] leading-none font-extrabold ${cor}`}>{valor}</p>
      <p className="mt-1 text-sm text-stone-500">{texto}</p>
    </div>
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
