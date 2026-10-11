import Sidebar from './Sidebar'
import { Button } from './ui/Form'

export default function Layout({ usuario, itensMenu, children }) {
  return (
    <div className="flex h-screen bg-mist-50">
      <Sidebar usuario={usuario} itens={itensMenu} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}

// Estados de carregamento/erro — cada página decide quando mostrá-los.
export function Carregando({ texto = 'Carregando…' }) {
  return <p className="py-20 text-center text-sm text-stone-400">{texto}</p>
}

export function ErroCarregamento({ mensagem, onTentarNovamente }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      <span>{mensagem}</span>
      {onTentarNovamente && (
        <Button variant="secondary" size="sm" onClick={onTentarNovamente}>Tentar novamente</Button>
      )}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-2xl border border-stone-200/80 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// Abas no topo da lista. abas: [{ id, label }]; contagem (opcional): { [id]: número }, aparece ao lado do nome.
// O que vier em children fica do lado direito da linha das abas (ex.: um filtro).
export function Abas({ abas, atual, onTrocar, contagem, children }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-stone-200">
      <div className="flex gap-6">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => onTrocar(a.id)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold transition ${
              atual === a.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {a.label}
            {contagem && ` · ${contagem[a.id]}`}
          </button>
        ))}
      </div>
      {children}
    </div>
  )
}

// Tabela das listas: o cartão, o cabeçalho e a linha entre os registros.
// colunas: os títulos ('' = coluna sem título, ex.: a dos botões; false = coluna que não aparece).
// As linhas (<tr>) vêm de quem usa.
export function Tabela({ colunas, children }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 bg-stone-50/70 text-left text-xs font-semibold tracking-wide text-stone-400">
            {colunas.filter((titulo) => titulo !== false).map((titulo, i) => <th key={i} className="px-5 py-3">{titulo}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">{children}</tbody>
      </table>
    </Card>
  )
}

export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center">
      <p className="font-semibold text-stone-700">{title}</p>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-stone-500">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
