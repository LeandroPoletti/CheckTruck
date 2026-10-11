// Base das etiquetas: o formato é um só; cada etiqueta tem seus textos e cores.
// opcoes: { valor: { label, cls } }; um valor que não está na lista usa o padrao.
function Etiqueta({ opcoes, valor, padrao, letra = 'text-[11px]' }) {
  const it = opcoes[valor] || opcoes[padrao]
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 font-semibold tracking-wide ${letra} ${it.cls}`}>
      {it.label}
    </span>
  )
}

const STATUS = {
  ok: { label: 'OK', cls: 'bg-white text-brand-700 border-brand-300' },
  atencao: { label: 'ATENÇÃO', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
  critico: { label: 'CRÍTICO', cls: 'bg-red-50 text-red-700 border-red-300' },
}

export function StatusBadge({ status }) {
  return <Etiqueta opcoes={STATUS} valor={status} padrao="ok" />
}

const ATIVO = {
  ativo: { label: 'ATIVO', cls: 'bg-brand-50 text-brand-700 border-brand-300' },
  inativo: { label: 'INATIVO', cls: 'bg-stone-50 text-stone-500 border-stone-300' },
}

export function AtivoBadge({ ativo }) {
  return <Etiqueta opcoes={ATIVO} valor={ativo ? 'ativo' : 'inativo'} />
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
const URGENCIA = {
  Alta: { label: 'URGENTE', cls: 'bg-red-50 text-red-700 border-red-300' },
  Media: { label: 'MÉDIA', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
  Baixa: { label: 'BAIXA', cls: 'bg-mist-100 text-brand-700 border-brand-200' },
}

export function UrgenciaBadge({ urgencia }) {
  return <Etiqueta opcoes={URGENCIA} valor={urgencia} padrao="Baixa" />
}

const STATUS_CHAMADO = {
  Pendente: { label: 'Pendente', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
  Concluido: { label: 'Concluído', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
}

export function ChamadoStatusBadge({ status }) {
  return <Etiqueta opcoes={STATUS_CHAMADO} valor={status} padrao="Pendente" />
}

// De onde vem o intervalo que vale (prioridade: caminhão → empresa → fábrica → padrão do sistema)
const ORIGEM = {
  caminhao: { label: 'DO CAMINHÃO', cls: 'bg-brand-700 text-white border-brand-700' },
  empresa: { label: 'DA EMPRESA', cls: 'bg-brand-500 text-white border-brand-500' },
  fabrica: { label: 'DE FÁBRICA', cls: 'bg-mist-100 text-brand-700 border-brand-300' },
  padrao: { label: 'PADRÃO DO SISTEMA', cls: 'bg-white text-stone-500 border-stone-300' },
  nenhum: { label: 'NÃO ACOMPANHADO', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
}

export function OrigemIntervaloBadge({ origem }) {
  return <Etiqueta opcoes={ORIGEM} valor={origem} padrao="nenhum" letra="text-[10px]" />
}
