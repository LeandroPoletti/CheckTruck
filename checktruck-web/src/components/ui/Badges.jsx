export function StatusBadge({ status }) {
  const map = {
    ok: { label: 'OK', cls: 'bg-white text-brand-700 border-brand-300' },
    atencao: { label: 'ATENÇÃO', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
    critico: { label: 'CRÍTICO', cls: 'bg-red-50 text-red-700 border-red-300' },
  }
  const it = map[status] || map.ok
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${it.cls}`}>
      {it.label}
    </span>
  )
}

export function PlacaBadge({ placa, size = 'md' }) {
  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  }
  return (
    <span className={`inline-block font-mono-label font-semibold tracking-wider border border-brand-300 rounded-md text-brand-800 bg-brand-50 ${sizes[size]}`}>
      {placa}
    </span>
  )
}

export function UrgenciaBadge({ urgencia }) {
  const map = {
    alta: { label: 'URGENTE', cls: 'bg-red-50 text-red-700 border-red-300' },
    media: { label: 'MÉDIA', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
    baixa: { label: 'BAIXA', cls: 'bg-mist-100 text-brand-700 border-brand-200' },
  }
  const it = map[urgencia] || map.baixa
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${it.cls}`}>
      {it.label}
    </span>
  )
}

export function ChamadoStatusBadge({ status }) {
  const map = {
    aberto: { label: 'Aberto', cls: 'bg-red-50 text-red-700 border-red-300' },
    em_andamento: { label: 'Em andamento', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
    resolvido: { label: 'Resolvido', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  }
  const it = map[status] || map.aberto
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${it.cls}`}>
      {it.label}
    </span>
  )
}
