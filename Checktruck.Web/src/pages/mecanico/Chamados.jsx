import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { PageHeader, Card, EmptyState } from '../../components/Layout'
import { ChamadoStatusBadge, UrgenciaBadge, PlacaBadge } from '../../components/ui/Badges'
import { Button, Select } from '../../components/ui/Form'
import { formatDataHora } from '../../data/domain'
import NovoChamadoModal from '../../components/modals/NovoChamadoModal'

export default function MecanicoChamados() {
  const { chamados, veiculos, usuarios, user, updateChamado } = useApp()
  const navigate = useNavigate()
  const [novoOpen, setNovoOpen] = useState(false)

  const ordenados = [...chamados].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))

  function atender(chamado) {
    updateChamado(chamado.id, { status: 'em_andamento', atendidoPorId: user.id })
  }

  return (
    <>
      <PageHeader
        title="Chamados"
        subtitle="Ocorrências abertas pelos motoristas e pela equipe técnica"
        action={<Button onClick={() => setNovoOpen(true)}><Plus size={16} /> Abrir chamado</Button>}
      />

      {ordenados.length === 0 ? (
        <EmptyState title="Nenhum chamado registrado" />
      ) : (
        <div className="space-y-3">
          {ordenados.map((c) => {
            const veiculo = veiculos.find((v) => v.id === c.veiculoId)
            const autor = usuarios.find((u) => u.id === c.abertoPorId)
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
                      <span>{autor?.nome}</span>
                      <span>{formatDataHora(c.criadoEm)}</span>
                      {veiculo && (
                        <button onClick={() => navigate(`/mecanico/veiculos/${veiculo.id}`)}>
                          <PlacaBadge placa={veiculo.placa} size="sm" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {c.status === 'aberto' && (
                      <Button size="sm" onClick={() => atender(c)}>Atender</Button>
                    )}
                    <Select
                      value={c.status}
                      onChange={(e) => updateChamado(c.id, { status: e.target.value })}
                      className="w-40"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="resolvido">Resolvido</option>
                    </Select>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <NovoChamadoModal open={novoOpen} onClose={() => setNovoOpen(false)} />
    </>
  )
}
