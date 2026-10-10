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

// urgencia e status: nomes dos enums UrgenciaChamado e StatusChamado da API
export function UrgenciaBadge({ urgencia }) {
  const map = {
    Alta: { label: 'URGENTE', cls: 'bg-red-50 text-red-700 border-red-300' },
    Media: { label: 'MÉDIA', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
    Baixa: { label: 'BAIXA', cls: 'bg-mist-100 text-brand-700 border-brand-200' },
  }
  const it = map[urgencia] || map.Baixa
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${it.cls}`}>
      {it.label}
    </span>
  )
}

export function ChamadoStatusBadge({ status }) {
  const map = {
    Pendente: { label: 'Pendente', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
    Concluido: { label: 'Concluído', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  }
  const it = map[status] || map.Pendente
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${it.cls}`}>
      {it.label}
    </span>
  )
}

// De onde vem o intervalo que vale (prioridade: caminhão → empresa → fábrica → padrão do sistema)
export function OrigemIntervaloBadge({ origem }) {
  const map = {
    caminhao: { label: 'DO CAMINHÃO', cls: 'bg-brand-700 text-white border-brand-700' },
    empresa: { label: 'DA EMPRESA', cls: 'bg-brand-500 text-white border-brand-500' },
    fabrica: { label: 'DE FÁBRICA', cls: 'bg-mist-100 text-brand-700 border-brand-300' },
    padrao: { label: 'PADRÃO DO SISTEMA', cls: 'bg-white text-stone-500 border-stone-300' },
    nenhum: { label: 'NÃO ACOMPANHADO', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
  }
  const it = map[origem] || map.nenhum
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide ${it.cls}`}>
      {it.label}
    </span>
  )
}
