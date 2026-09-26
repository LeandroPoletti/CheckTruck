import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { PageHeader, Card, EmptyState, AvisoApi } from '../../components/Layout'
import { CHAMADOS_DISPONIVEIS } from '../../services'
import { ChamadoStatusBadge, UrgenciaBadge, PlacaBadge } from '../../components/ui/Badges'
import { Select } from '../../components/ui/Form'
import { formatDataHora, nomePessoa } from '../../data/domain'

export default function GerenteChamados() {
  const { chamados, veiculos, pessoas, updateChamado } = useApp()
  const navigate = useNavigate()
  const [erro, setErro] = useState('')

  async function mudarStatus(id, patch) {
    setErro('')
    try {
      await updateChamado(id, patch)
    } catch (e) {
      setErro(e.message)
    }
  }

  const ordenados = [...chamados].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))

  return (
    <>
      <PageHeader
        title="Chamados"
        subtitle={`${chamados.filter((c) => c.status !== 'resolvido').length} em aberto · abertos por mecânicos e motoristas`}
      />

      {/* TODO: API — GET/POST/PUT /api/Chamado (entidade Chamado ainda não existe) */}
      {!CHAMADOS_DISPONIVEIS && (
        <AvisoApi>Chamados ainda não estão disponíveis na API — a lista fica vazia e novas aberturas retornam erro.</AvisoApi>
      )}
      {erro && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      {ordenados.length === 0 ? (
        <EmptyState title="Nenhum chamado registrado" subtitle="Chamados abertos pela equipe aparecerão aqui." />
      ) : (
        <div className="space-y-3">
          {ordenados.map((c) => {
            const veiculo = veiculos.find((v) => v.id === c.veiculoId)
            const autor = pessoas.find((p) => p.usuarioGuid === c.abertoPorId)
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
                      <span>{nomePessoa(autor)} · {autor?.perfil === 'mecanico' ? 'Técnico' : 'Motorista'}</span>
                      <span>{formatDataHora(c.criadoEm)}</span>
                      {veiculo && (
                        <button onClick={() => navigate(`/gerente/veiculos/${veiculo.id}`)}>
                          <PlacaBadge placa={veiculo.placa} size="sm" />
                        </button>
                      )}
                    </div>
                  </div>
                  <Select
                    value={c.status}
                    onChange={(e) => mudarStatus(c.id, { status: e.target.value })}
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
