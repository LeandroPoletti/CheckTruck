import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-mist-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
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

export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center">
      <p className="font-semibold text-stone-700">{title}</p>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-stone-500">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
