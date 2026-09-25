import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { PageHeader, Card } from '../../components/Layout'
import { Button, Select } from '../../components/ui/Form'
import { formatKm } from '../../data/domain'

export default function Intervalos() {
  const { modelos, geracoes, tiposManutencao, intervalos } = useApp()
  const [modeloId, setModeloId] = useState(modelos[2]?.id || modelos[0]?.id)
  const [componente, setComponente] = useState('todos')

  const modeloAtivo = modelos.find((m) => m.id === modeloId)
  const geracaoAtiva = geracoes.find((g) => g.id === modeloAtivo?.geracaoId)

  const linhas = useMemo(() => {
    return intervalos
      .filter((it) => it.modeloId === modeloId)
      .filter((it) => componente === 'todos' || tiposManutencao.find((t) => t.id === it.tipoId)?.componente === componente)
      .map((it) => ({ ...it, tipo: tiposManutencao.find((t) => t.id === it.tipoId) }))
  }, [intervalos, modeloId, componente, tiposManutencao])

  const componentes = [...new Set(tiposManutencao.map((t) => t.componente))]

  return (
    <>
      <PageHeader
        title="Intervalos recomendados"
        subtitle="Um intervalo por modelo e tipo de manutenção · seed oficial Volvo e Meritor"
        action={
          <div className="flex gap-2">
            <Button variant="secondary"><Plus size={16} /> Tipo de manutenção</Button>
            <Button><Plus size={16} /> Intervalo</Button>
          </div>
        }
      />

      <div className="mb-5 flex gap-3">
        <Select value={modeloId} onChange={(e) => setModeloId(e.target.value)} className="w-64">
          {modelos.map((m) => {
            const g = geracoes.find((gg) => gg.id === m.geracaoId)
            return <option key={m.id} value={m.id}>{m.nome} · {g?.nome}</option>
          })}
        </Select>
        <Select value={componente} onChange={(e) => setComponente(e.target.value)} className="w-48">
          <option value="todos">Componente: todos</option>
          {componentes.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
              <th className="px-5 py-3">TIPO DE MANUTENÇÃO</th>
              <th className="px-5 py-3">COMPONENTE</th>
              <th className="px-5 py-3">INTERVALO PADRÃO</th>
              <th className="px-5 py-3">1ª TROCA</th>
              <th className="px-5 py-3">FONTE</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {linhas.map((it) => (
              <tr key={it.tipoId} className="border-b border-stone-100 last:border-0">
                <td className="px-5 py-3.5 font-semibold text-stone-800">{it.tipo?.nome}</td>
                <td className="px-5 py-3.5 text-stone-500">{it.tipo?.componente}</td>
                <td className="px-5 py-3.5 text-stone-700">{formatKm(it.intervaloKm)}</td>
                <td className="px-5 py-3.5">
                  {it.intervaloKmPrimeira ? (
                    <span className="font-semibold text-amber-600">{formatKm(it.intervaloKmPrimeira)}</span>
                  ) : (
                    <span className="text-stone-400">igual ao padrão</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-stone-500">{it.fonte}</td>
                <td className="px-5 py-3.5 text-right">
                  <button className="text-xs font-semibold text-brand-700 hover:text-brand-900">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <span className="mr-1 rounded-full bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-700">1ª TROCA</span>
        Quando o registro de manutenção marca primeira troca, o sistema usa o intervalo de
        amaciamento em vez do padrão. Câmbio Gen 4/5 zerômetro: 200.000 km. Diferencial Meritor: 10.000 km.
      </div>
    </>
  )
}
