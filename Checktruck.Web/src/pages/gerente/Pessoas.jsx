import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { PageHeader, Card } from '../../components/Layout'
import { Button, Select } from '../../components/ui/Form'
import { PlacaBadge } from '../../components/ui/Badges'
import NovaPessoaModal from '../../components/modals/NovaPessoaModal'

const TABS = [
  { id: 'motorista', label: 'Motoristas' },
  { id: 'mecanico', label: 'Técnicos' },
  { id: 'inativos', label: 'Inativos' },
]

export default function Pessoas() {
  const { usuarios, veiculos, updateVeiculo } = useApp()
  const [tab, setTab] = useState('motorista')
  const [novoOpen, setNovoOpen] = useState(false)

  const contagens = {
    motorista: usuarios.filter((u) => u.perfil === 'motorista' && u.ativo).length,
    mecanico: usuarios.filter((u) => u.perfil === 'mecanico' && u.ativo).length,
    inativos: usuarios.filter((u) => !u.ativo && u.perfil !== 'gerente').length,
  }

  const listaFiltrada = useMemo(() => {
    if (tab === 'inativos') return usuarios.filter((u) => !u.ativo && u.perfil !== 'gerente')
    return usuarios.filter((u) => u.perfil === tab && u.ativo)
  }, [usuarios, tab])

  const veiculosLivres = veiculos.filter((v) => v.ativo && !v.motoristaId)

  return (
    <>
      <PageHeader
        title="Pessoas"
        subtitle="Contas de acesso, CPF e vínculo com veículos"
        action={
          <Button onClick={() => setNovoOpen(true)}>
            <Plus size={16} /> Nova pessoa
          </Button>
        }
      />

      <div className="mb-5 flex gap-6 border-b border-stone-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold transition ${
              tab === t.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {t.label} · {contagens[t.id]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {listaFiltrada.map((p) => {
          const veiculo = veiculos.find((v) => v.motoristaId === p.id)
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-stone-900">{p.nome}</p>
                  <p className="text-xs text-stone-500">{p.email}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    !p.ativo
                      ? 'border-stone-300 bg-stone-50 text-stone-500'
                      : p.perfil === 'motorista' && !veiculo
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-brand-300 bg-brand-50 text-brand-700'
                  }`}
                >
                  {!p.ativo ? 'INATIVO' : p.perfil === 'motorista' && !veiculo ? 'SEM VEÍCULO' : 'ATIVO'}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-stone-400">CPF</span>
                <span className="font-mono-label text-stone-700">{p.cpf || '—'}</span>
              </div>

              {p.perfil === 'motorista' && (
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-stone-400">Veículo</span>
                  {veiculo ? (
                    <PlacaBadge placa={veiculo.placa} size="sm" />
                  ) : (
                    <VincularSelect
                      veiculosLivres={veiculosLivres}
                      onVincular={(veiculoId) => updateVeiculo(veiculoId, { motoristaId: p.id })}
                    />
                  )}
                </div>
              )}
            </Card>
          )
        })}

        <button
          onClick={() => setNovoOpen(true)}
          className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-stone-300 text-stone-400 transition hover:border-brand-400 hover:text-brand-600"
        >
          <Plus size={20} />
          <span className="text-sm font-semibold">Cadastrar {tab === 'mecanico' ? 'técnico' : 'motorista'}</span>
          <span className="text-xs">conta de acesso · CPF · veículo</span>
        </button>
      </div>

      <NovaPessoaModal
        open={novoOpen}
        perfilInicial={tab === 'mecanico' ? 'mecanico' : 'motorista'}
        onClose={() => setNovoOpen(false)}
      />
    </>
  )
}

function VincularSelect({ veiculosLivres, onVincular }) {
  if (veiculosLivres.length === 0) {
    return <span className="text-xs text-stone-400">Nenhum livre</span>
  }
  return (
    <Select
      className="!w-auto py-1 text-xs"
      defaultValue=""
      onChange={(e) => {
        if (e.target.value) onVincular(e.target.value)
      }}
    >
      <option value="">Vincular</option>
      {veiculosLivres.map((v) => (
        <option key={v.id} value={v.id}>{v.placa}</option>
      ))}
    </Select>
  )
}
