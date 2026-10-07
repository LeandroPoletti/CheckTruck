import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { ChamadoStatusBadge, UrgenciaBadge, PlacaBadge } from '../components/ui/Badges'
import { Select } from '../components/ui/Form'
import { formatDataHora } from '../data/domain'
import { chamadoService } from '../services'

export default function Chamados() {
  const navigate = useNavigate()
  const [chamados, setChamados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [erroAcao, setErroAcao] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let cancelado = false
    chamadoService.listar()
      .then((lista) => { if (!cancelado) setChamados(lista) })
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

  async function atualizarChamado(id, patch) {
    setErroAcao(null)
    try {
      await chamadoService.atualizar(id, patch)
      recarregar()
    } catch (e) {
      setErroAcao(e.message)
    }
  }


  const ordenados = [...chamados].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader
        title="Chamados"
        subtitle={`${chamados.filter((c) => c.status !== 'resolvido').length} em aberto · abertos por mecânicos e motoristas`}
      />

      {erroAcao && <ErroCarregamento mensagem={erroAcao} />}

      {ordenados.length === 0 ? (
        <EmptyState title="Nenhum chamado registrado" subtitle="Chamados abertos pela equipe aparecerão aqui." />
      ) : (
        <div className="space-y-3">
          {ordenados.map((c) => {
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-900">{c.tipo}</p>
                      <UrgenciaBadge urgencia={c.urgencia} />
                      <ChamadoStatusBadge status={c.status} />
                    </div>
                    <p className="mt-1 text-sm text-stone-600">{c.descricao}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
                      <span>{c.abertoPorNome}</span>
                      <span>{formatDataHora(c.criadoEm)}</span>
                      {c.veiculoId && (
                        <button onClick={() => navigate(`/veiculos/${c.veiculoId}`)}>
                          <PlacaBadge placa={c.placa} size="sm" />
                        </button>
                      )}
                    </div>
                  </div>
                  <Select
                    value={c.status}
                    onChange={(e) => atualizarChamado(c.id, { status: e.target.value })}
                    className="w-40"
                  >
                    <option value="aberto">Aberto</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="resolvido">Resolvido</option>
                  </Select>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
