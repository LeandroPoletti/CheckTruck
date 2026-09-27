import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../../components/Layout'
import { ChamadoStatusBadge, UrgenciaBadge, PlacaBadge } from '../../components/ui/Badges'
import { Button } from '../../components/ui/Form'
import { formatDataHora } from '../../data/domain'
import NovoChamadoModal from '../../components/modals/NovoChamadoModal'
import { chamadoService, veiculoService, filtro } from '../../services'
import { obterUsuario } from '../../services/sessao'

export default function MotoristaChamados() {
  const user = obterUsuario()
  const [novoOpen, setNovoOpen] = useState(false)
  const [chamados, setChamados] = useState([])
  const [veiculo, setVeiculo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  // Chamados + o veículo ativo do motorista logado ($filter=Motorista/Id eq X)
  useEffect(() => {
    let cancelado = false
    // sem GET /api/Usuario/me o front não conhece o motoristaId do usuário logado
    const buscaVeiculo = user?.motoristaId
      ? veiculoService.listar(filtro.porId('Motorista', user.motoristaId))
      : Promise.resolve([])
    Promise.all([chamadoService.listar(), buscaVeiculo])
      .then(([lista, [v]]) => {
        if (cancelado) return
        setChamados(lista)
        setVeiculo(v?.ativo ? v : null)
      })
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

  const meus = chamados
    .filter((c) => c.abertoPorId === user.id)
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Meus chamados"
        subtitle="Ocorrências que você reportou"
        action={
          <Button onClick={() => setNovoOpen(true)} disabled={!veiculo}>
            <Plus size={16} /> Abrir chamado
          </Button>
        }
      />

      {!veiculo && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Você ainda não tem um veículo vinculado — fale com o gerente para abrir um chamado.
        </p>
      )}

      {meus.length === 0 ? (
        <EmptyState title="Nenhum chamado aberto" subtitle="Quando você reportar um problema, ele aparece aqui." />
      ) : (
        <div className="space-y-3">
          {meus.map((c) => {
            const v = veiculos.find((vv) => vv.id === c.veiculoId)
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-stone-900">{c.tipo}</p>
                  <UrgenciaBadge urgencia={c.urgencia} />
                  <ChamadoStatusBadge status={c.status} />
                </div>
                <p className="mt-1 text-sm text-stone-600">{c.descricao}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
                  <span>{formatDataHora(c.criadoEm)}</span>
                  {v && <PlacaBadge placa={v.placa} size="sm" />}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <NovoChamadoModal open={novoOpen} onClose={() => setNovoOpen(false)} veiculo={veiculo} onSalvo={recarregar} />
    </>
  )
}
