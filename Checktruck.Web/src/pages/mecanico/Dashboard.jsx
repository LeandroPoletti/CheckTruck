import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, PageHeader, Carregando, ErroCarregamento } from '../../components/Layout'
import { StatusBadge, PlacaBadge } from '../../components/ui/Badges'
import { formatKm } from '../../data/domain'
import { dashboardService, chamadoService } from '../../services'
import { obterUsuario } from '../../services/sessao'

export default function MecanicoDashboard() {
  const user = obterUsuario()
  const navigate = useNavigate()
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  // Situação da frota calculada pela API (todas as prioridades, sem limite) + chamados
  useEffect(() => {
    let cancelado = false
    Promise.all([dashboardService.obter(), chamadoService.listar()])
      .then(([situacao, chamados]) => {
        if (!cancelado) setDados({ ...situacao, chamados })
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

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  const { frotaAtiva, contagem, alertas: prioridades, chamados } = dados
  const meusChamados = chamados.filter((c) => c.status !== 'resolvido')

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Olá, ${user.nome.split(' ')[0]} · ${frotaAtiva} veículos na frota`} />

      <div className="grid grid-cols-3 gap-4">
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
          <h3 className="mb-4 font-semibold text-stone-900">Manutenções prioritárias</h3>
          {prioridades.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">Nenhum veículo com manutenção pendente.</p>
          ) : (
            <div className="space-y-4">
              {prioridades.map((item) => {
                return (
                  <button
                    key={item.veiculoId}
                    onClick={() => navigate(`/mecanico/veiculos/${item.veiculoId}`)}
                    className="flex w-full items-center justify-between rounded-lg border border-stone-100 px-3 py-3 text-left hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <PlacaBadge placa={item.placa} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-stone-800">{item.tipoNome}</p>
                        <p className="text-xs text-stone-500">{item.modeloNome} · {item.geracaoNome}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={item.status} />
                      <p className="mt-1 text-xs text-stone-400">
                        {item.kmRestante <= 0 ? `vencido há ${formatKm(Math.abs(item.kmRestante))}` : `faltam ${formatKm(item.kmRestante)}`}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-stone-900">Chamados em aberto</h3>
          {meusChamados.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-400">Nenhum chamado no momento.</p>
          ) : (
            <div className="space-y-3">
              {meusChamados.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate('/mecanico/chamados')}
                  className="block w-full rounded-lg border border-stone-100 px-3 py-2.5 text-left hover:bg-stone-50"
                >
                  <p className="text-sm font-semibold text-stone-800">{c.tipo}</p>
                  <p className="text-xs text-stone-400 line-clamp-1">{c.descricao}</p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
