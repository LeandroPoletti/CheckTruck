import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader, Abas, Card, EmptyState, Carregando, ErroCarregamento } from '../components/Layout'
import { ChamadoStatusBadge, UrgenciaBadge, PlacaBadge } from '../components/ui/Badges'
import { Button } from '../components/ui/Form'
import AcoesLinha from '../components/ui/AcoesLinha'
import ChamadoModal from '../components/modals/ChamadoModal'
import ResolverChamadoModal from '../components/modals/ResolverChamadoModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import VerMais from '../components/ui/VerMais'
import { chamadoService } from '../services'
import { useCargaDaTela } from '../hooks/useCarga'
import { obterUsuario } from '../services/sessao'
import { pode } from '../data/acesso'
import { nomeTipoOcorrencia } from '../data/chamados'
import { formatDataHora } from '../data/domain'
import { POR_VEZ } from '../data/pagina'

const ABAS = [
  { id: 'Pendente', label: 'Pendentes' },
  { id: 'Concluido', label: 'Concluídos' },
]

// Quem só abre chamado vê os próprios; quem atende vê todos (a API já devolve filtrado). Os pendentes vêm todos, e os
// concluídos, 50 de cada vez (Ver mais).
export default function Chamados() {
  const navigate = useNavigate()
  const eu = obterUsuario()
  const podeAbrir = pode(eu, 'AbrirChamados')
  const podeAtender = pode(eu, 'AtenderChamados')
  const podeVerCaminhao = pode(eu, 'VerFrota')

  const [aba, setAba] = useState('Pendente')
  const [quantosConcluidos, setQuantosConcluidos] = useState(POR_VEZ)
  const { dados, carregando, erro, recarregar, tentarNovamente } = useCargaDaTela(
    () => chamadoService.listar(quantosConcluidos), [quantosConcluidos], { manter: 'chamados' })
  const [erroAcao, setErroAcao] = useState(null)
  const [editando, setEditando] = useState(null) // { chamado } (null ao abrir) enquanto o modal está aberto
  const [resolvendo, setResolvendo] = useState(null)
  const [excluindo, setExcluindo] = useState(null)

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
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  const { pendentes, concluidos } = dados
  const contagem = { Pendente: pendentes.length, Concluido: concluidos.total }
  const lista = aba === 'Pendente' ? pendentes : concluidos.itens

  return (
    <>
      <PageHeader
        title="Chamados"
        subtitle={podeAtender ? 'Problemas relatados nos caminhões' : 'Os chamados que você abriu'}
        action={podeAbrir && <Button onClick={() => setEditando({ chamado: null })}><Plus size={16} /> Abrir chamado</Button>}
      />

      <Abas abas={ABAS} atual={aba} onTrocar={setAba} contagem={contagem} />

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

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {podeAtender && c.status === 'Pendente' && (
                    <div className="flex gap-2">
                      {c.atendidoPorId !== eu.id && (
                        <Button variant="secondary" size="sm" onClick={() => atender(c)}>Atender</Button>
                      )}
                      <Button size="sm" onClick={() => setResolvendo(c)}>Resolver</Button>
                    </div>
                  )}
                  {podeAlterar(c) && <AcoesLinha onEditar={() => setEditando({ chamado: c })} onExcluir={() => setExcluindo(c)} />}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {aba === 'Concluido' && (
        <VerMais
          quantos={quantosConcluidos}
          mostrando={concluidos.itens.length}
          total={concluidos.total}
          onVerMais={setQuantosConcluidos}
          className="mt-5"
        />
      )}

      {editando && <ChamadoModal chamado={editando.chamado} onClose={() => setEditando(null)} onSalvo={recarregar} />}
      {resolvendo && <ResolverChamadoModal chamado={resolvendo} onClose={() => setResolvendo(null)} onSalvo={recarregar} />}
      {excluindo && (
        <ConfirmarExclusaoModal
          onClose={() => setExcluindo(null)}
          titulo="Excluir chamado"
          descricao={`Excluir o chamado de ${nomeTipoOcorrencia(excluindo.tipo)} do caminhão ${excluindo.placa}? Não dá para desfazer.`}
          onConfirmar={async () => {
            await chamadoService.excluir(excluindo.id)
            recarregar()
          }}
        />
      )}
    </>
  )
}
