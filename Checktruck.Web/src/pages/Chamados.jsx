import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { ChamadoStatusBadge, UrgenciaBadge, PlacaBadge } from '../components/ui/Badges'
import { Button } from '../components/ui/Form'
import ChamadoModal from '../components/modals/ChamadoModal'
import ResolverChamadoModal from '../components/modals/ResolverChamadoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { chamadoService } from '../services'
import { obterUsuario } from '../services/sessao'
import { pode } from '../data/acesso'
import { nomeTipoOcorrencia } from '../data/chamados'
import { formatDataHora } from '../data/domain'

const ABAS = [
  { id: 'Pendente', label: 'Pendentes' },
  { id: 'Concluido', label: 'Concluídos' },
]

// Quem só abre chamado vê os próprios; quem atende vê todos (a API já devolve filtrado).
export default function Chamados() {
  const navigate = useNavigate()
  const eu = obterUsuario()
  const podeAbrir = pode(eu, 'AbrirChamados')
  const podeAtender = pode(eu, 'AtenderChamados')
  const podeVerCaminhao = pode(eu, 'VerFrota')

  const [aba, setAba] = useState('Pendente')
  const [chamados, setChamados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [erroAcao, setErroAcao] = useState(null)
  const [versao, setVersao] = useState(0)
  const [editando, setEditando] = useState(null) // { chamado } (null ao abrir) enquanto o modal está aberto
  const [resolvendo, setResolvendo] = useState(null)
  const [excluindo, setExcluindo] = useState(null)

  useEffect(() => {
    let cancelado = false
    chamadoService.listar()
      .then((lista) => { if (!cancelado) setChamados(lista) })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [versao])

  // Após salvar: atualiza em segundo plano, sem desmontar a tela
  function recarregar() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  function tentarNovamente() {
    setCarregando(true)
    recarregar()
  }

  async function atender(chamado) {
    setErroAcao(null)
    try {
      await chamadoService.atender(chamado.id)
      recarregar()
    } catch (e) {
      setErroAcao(e.message)
    }
  }

  // Quem abriu mexe enquanto está pendente; Admin e Gestor mexem sempre
  const podeAlterar = (c) => eu.cuidaDosAcessos || (c.abertoPorId === eu.id && c.status === 'Pendente')

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  const contagem = {
    Pendente: chamados.filter((c) => c.status === 'Pendente').length,
    Concluido: chamados.filter((c) => c.status === 'Concluido').length,
  }
  const lista = chamados.filter((c) => c.status === aba)

  return (
    <>
      <PageHeader
        title="Chamados"
        subtitle={podeAtender ? 'Problemas relatados nos caminhões' : 'Os chamados que você abriu'}
        action={podeAbrir && <Button onClick={() => setEditando({ chamado: null })}><Plus size={16} /> Abrir chamado</Button>}
      />

      <div className="mb-5 flex gap-6 border-b border-stone-200">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold transition ${
              aba === a.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {a.label} · {contagem[a.id]}
          </button>
        ))}
      </div>

      {erroAcao && <ErroCarregamento mensagem={erroAcao} />}

      {lista.length === 0 ? (
        <EmptyState
          title={aba === 'Pendente' ? 'Nenhum chamado pendente' : 'Nenhum chamado concluído'}
          subtitle={aba === 'Pendente' && podeAbrir ? 'Use "Abrir chamado" para contar um problema do caminhão.' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {lista.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {podeVerCaminhao ? (
                      <button onClick={() => navigate(`/veiculos/${c.veiculoId}`)}>
                        <PlacaBadge placa={c.placa} size="sm" />
                      </button>
                    ) : (
                      <PlacaBadge placa={c.placa} size="sm" />
                    )}
                    <p className="font-semibold text-stone-900">{nomeTipoOcorrencia(c.tipo)}</p>
                    <UrgenciaBadge urgencia={c.urgencia} />
                    <ChamadoStatusBadge status={c.status} />
                  </div>
                  <p className="mt-1.5 text-sm text-stone-600">{c.descricao}</p>
                  {c.solucao && (
                    <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      <span className="font-semibold">O que foi feito:</span> {c.solucao}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-400">
                    <span>Aberto por {c.abertoPorNome} · {formatDataHora(c.abertoEm)}</span>
                    <span>{c.atendidoPorNome ? `Atendido por ${c.atendidoPorNome}` : 'Ninguém atendendo ainda'}</span>
                    {c.concluidoEm && <span>Concluído em {formatDataHora(c.concluidoEm)}</span>}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2 text-xs font-semibold">
                  {podeAtender && c.status === 'Pendente' && (
                    <div className="flex gap-2">
                      {c.atendidoPorId !== eu.id && (
                        <Button variant="secondary" size="sm" onClick={() => atender(c)}>Atender</Button>
                      )}
                      <Button size="sm" onClick={() => setResolvendo(c)}>Resolver</Button>
                    </div>
                  )}
                  {podeAlterar(c) && (
                    <div className="flex gap-3">
                      <button onClick={() => setEditando({ chamado: c })} className="text-brand-700 hover:underline">Editar</button>
                      <button onClick={() => setExcluindo(c)} className="text-red-600 hover:underline">Excluir</button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editando && <ChamadoModal chamado={editando.chamado} onClose={() => setEditando(null)} onSalvo={recarregar} />}
      {resolvendo && <ResolverChamadoModal chamado={resolvendo} onClose={() => setResolvendo(null)} onSalvo={recarregar} />}
      <ConfirmarExclusaoModal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        titulo="Excluir chamado"
        descricao={`Excluir o chamado de ${nomeTipoOcorrencia(excluindo?.tipo)} do caminhão ${excluindo?.placa}? Não dá para desfazer.`}
        onConfirmar={async () => {
          await chamadoService.excluir(excluindo.id)
          recarregar()
        }}
      />
    </>
  )
}
