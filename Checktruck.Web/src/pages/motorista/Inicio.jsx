import { useEffect, useState } from 'react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../../components/Layout'
import { StatusBadge, PlacaBadge } from '../../components/ui/Badges'
import { Button } from '../../components/ui/Form'
import { formatKm, getModeloCompleto, getSituacaoVeiculo, getStatusGeralVeiculo } from '../../data/domain'
import AtualizarKmModal from '../../components/modals/AtualizarKmModal'
import NovoChamadoModal from '../../components/modals/NovoChamadoModal'
import {
  veiculoService, modeloService, geracaoService, fabricanteService, tipoManutencaoService,
  intervaloService, manutencaoService, filtro,
} from '../../services'
import { obterUsuario } from '../../services/sessao'

export default function MotoristaInicio() {
  const user = obterUsuario()
  const [kmOpen, setKmOpen] = useState(false)
  const [chamadoOpen, setChamadoOpen] = useState(false)
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  // Veículo ativo do motorista logado + o que a situação dele precisa (modelo, intervalos, histórico)
  useEffect(() => {
    let cancelado = false
    async function carregar() {
      // sem GET /api/Usuario/me o front não conhece o motoristaId do usuário logado
      if (!user?.motoristaId) return null
      const [veiculo] = await veiculoService.listar(filtro.porId('Motorista', user.motoristaId))
      if (!veiculo?.ativo) return null
      const [modelo, geracoes, fabricantes, tiposManutencao, intervalos, registros] = await Promise.all([
        modeloService.obter(veiculo.modeloId),
        geracaoService.listar(),
        fabricanteService.listar(),
        tipoManutencaoService.listar(),
        intervaloService.listar(filtro.porId('Modelo', veiculo.modeloId)),
        manutencaoService.listar(filtro.porId('Veiculo', veiculo.id)),
      ])
      return { veiculo, registros, catalogo: { modelos: [modelo], geracoes, fabricantes, tiposManutencao, intervalos } }
    }
    carregar()
      .then((d) => { if (!cancelado) setDados(d) })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [user?.motoristaId, versao])

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

  const veiculo = dados?.veiculo
  const registros = dados?.registros ?? []
  const catalogo = dados?.catalogo

  return (
    <>
      <PageHeader title="Meu veículo" subtitle={`Olá, ${user.nome.split(' ')[0]}`} />

      {!veiculo ? (
        <EmptyState
          title="Nenhum veículo vinculado"
          subtitle="Assim que o gerente vincular um caminhão à sua conta, ele aparecerá aqui."
        />
      ) : (
        <>
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <PlacaBadge placa={veiculo.placa} size="lg" />
                  <StatusBadge status={getStatusGeralVeiculo(catalogo, veiculo, registros)} />
                </div>
                <h1 className="mt-2 text-xl font-bold text-stone-900">
                  {getModeloCompleto(catalogo, veiculo.modeloId)?.fabricante?.nome} {getModeloCompleto(catalogo, veiculo.modeloId)?.modelo?.nome}
                </h1>
                <p className="text-sm text-stone-500">
                  {getModeloCompleto(catalogo, veiculo.modeloId)?.geracao?.nome} · {veiculo.anoFabricacao}/{veiculo.anoModelo}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setChamadoOpen(true)}>Abrir chamado</Button>
                <Button onClick={() => setKmOpen(true)}>Atualizar km</Button>
              </div>
            </div>

            <div className="mt-5 border-t border-stone-100 pt-4">
              <p className="text-xs font-semibold tracking-wide text-stone-400">KM ATUAL</p>
              <p className="mt-0.5 text-2xl font-bold text-stone-900">{formatKm(veiculo.kmAtual)}</p>
            </div>
          </Card>

          <Card className="mt-6 p-5">
            <h3 className="mb-4 font-semibold text-stone-900">Situação das manutenções</h3>
            <div className="space-y-4">
              {getSituacaoVeiculo(catalogo, veiculo, registros).map((s) => {
                const pct = Math.max(2, Math.min(100, (veiculo.kmAtual / s.kmProximaTroca) * 100))
                const barColor = s.status === 'critico' ? 'bg-red-500' : s.status === 'atencao' ? 'bg-amber-500' : 'bg-brand-600'
                const textColor = s.status === 'critico' ? 'text-red-600' : s.status === 'atencao' ? 'text-amber-600' : 'text-stone-400'
                return (
                  <div key={s.tipoId}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-stone-800">{s.tipo?.nome}</span>
                      <span className={`text-xs font-semibold ${textColor}`}>
                        {s.kmRestante <= 0 ? `vencido há ${formatKm(Math.abs(s.kmRestante))}` : `faltam ${formatKm(s.kmRestante)}`}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <AtualizarKmModal open={kmOpen} onClose={() => setKmOpen(false)} veiculo={veiculo} onSalvo={recarregar} />
          <NovoChamadoModal open={chamadoOpen} onClose={() => setChamadoOpen(false)} veiculo={veiculo} />
        </>
      )}
    </>
  )
}
