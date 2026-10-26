import { PERIODOS, erroDoPeriodo } from '../../data/periodo'
import { Input } from './Form'

// Período das OS, pela data da troca: os atalhos prontos e, em "Escolher datas", os campos De e Até.
// valor = { periodo, de, ate } (TODO_O_PERIODO no começo). quantas: as OS que sobraram, para o "3 OS no período".
export default function FiltroPeriodo({ valor, onChange, quantas, className = '' }) {
  const erro = erroDoPeriodo(valor)
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Período">
        <span className="mr-1 text-sm font-semibold text-stone-600">Período:</span>
        {PERIODOS.map((p) => {
          const escolhido = valor.periodo === p.id
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={escolhido}
              onClick={() => onChange({ ...valor, periodo: p.id })}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                escolhido
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-stone-300 bg-white text-stone-700 shadow-[0_2px_0_var(--color-stone-300)] hover:bg-stone-50'
              }`}
            >
              {p.nome}
            </button>
          )
        })}
        {valor.periodo !== 'tudo' && !erro && quantas > 0 && (
          <span className="ml-1 text-sm text-stone-500">{quantas} OS no período</span>
        )}
      </div>

      {valor.periodo === 'datas' && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
            De
            <Input type="date" value={valor.de} onChange={(e) => onChange({ ...valor, de: e.target.value })} error={!!erro} className="w-44" />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
            Até
            <Input type="date" value={valor.ate} onChange={(e) => onChange({ ...valor, ate: e.target.value })} error={!!erro} className="w-44" />
          </label>
          {erro && <span className="text-sm font-medium text-red-600">{erro}</span>}
        </div>
      )}
    </div>
  )
}
