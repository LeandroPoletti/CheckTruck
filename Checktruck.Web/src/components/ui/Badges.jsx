import { CircleCheck, TriangleAlert } from 'lucide-react'

// Base das etiquetas: o formato é um só; cada etiqueta tem seus textos, cores e (se tiver) o ícone.
// opcoes: { valor: { label, cls, icone } }; um valor que não está na lista usa o padrao.
function Etiqueta({ opcoes, valor, padrao }) {
  const { label, cls, icone: Icone } = opcoes[valor] || opcoes[padrao]
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {Icone && <Icone size={14} strokeWidth={2.5} />}
      {label}
    </span>
  )
}

const STATUS = {
  ok: { label: 'OK', cls: 'bg-ok-50 text-ok-700 border-ok-200', icone: CircleCheck },
  atencao: { label: 'Atenção', cls: 'bg-amber-50 text-amber-700 border-amber-300', icone: TriangleAlert },
  critico: { label: 'Crítico', cls: 'bg-red-50 text-red-700 border-red-300', icone: TriangleAlert },
}

export function StatusBadge({ status }) {
  return <Etiqueta opcoes={STATUS} valor={status} padrao="ok" />
}

const ATIVO = {
  ativo: { label: 'Ativo', cls: 'bg-ok-50 text-ok-700 border-ok-200' },
  inativo: { label: 'Inativo', cls: 'bg-stone-50 text-stone-500 border-stone-300' },
}

export function AtivoBadge({ ativo }) {
  return <Etiqueta opcoes={ATIVO} valor={ativo ? 'ativo' : 'inativo'} />
}

// A placa no desenho da placa Mercosul, igual à do app: faixa azul com BRASIL e a bandeira, letras pretas
const PLACA = {
  sm: { faixa: 'text-[6.5px] py-px', bandeira: 'h-[6px] w-[8px]', letras: 'text-[17px] px-2' },
  md: { faixa: 'text-[7.5px] py-[2px]', bandeira: 'h-[7px] w-[10px]', letras: 'text-[21px] px-2.5' },
  lg: { faixa: 'text-[9px] py-[3px]', bandeira: 'h-[9px] w-[12px]', letras: 'text-[30px] px-3.5' },
}

export function PlacaBadge({ placa, size = 'md' }) {
  const t = PLACA[size]
  return (
    <span className="inline-flex shrink-0 flex-col overflow-hidden rounded-md border-2 border-stone-900 bg-white align-middle" aria-label={`Placa ${placa}`}>
      <span className={`relative bg-[#1f3a93] px-5 text-center font-bold leading-none tracking-[.25em] text-white ${t.faixa}`}>
        BRASIL
        <Bandeira className={`absolute right-1 top-1/2 -translate-y-1/2 ${t.bandeira}`} />
      </span>
      <span className={`text-center font-placa font-bold leading-tight tracking-wide text-stone-900 ${t.letras}`}>{placa}</span>
    </span>
  )
}

function Bandeira({ className }) {
  return (
    <svg viewBox="0 0 14 10" className={className} aria-hidden="true">
      <rect width="14" height="10" fill="#159447" />
      <path d="M7 1 13 5 7 9 1 5Z" fill="#f7d417" />
      <circle cx="7" cy="5" r="2.3" fill="#1f3a93" />
    </svg>
  )
}

// "1ª troca" ao lado do item trocado na OS (a troca de amaciamento)
export function SeloPrimeiraTroca() {
  return <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">1ª troca</span>
}

// urgencia e status: nomes dos enums UrgenciaChamado e StatusChamado da API
const URGENCIA = {
  Alta: { label: 'Urgente', cls: 'bg-red-50 text-red-700 border-red-300' },
  Media: { label: 'Média', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
  Baixa: { label: 'Baixa', cls: 'bg-mist-100 text-brand-700 border-brand-200' },
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
  caminhao: { label: 'Do caminhão', cls: 'bg-brand-700 text-white border-brand-700' },
  empresa: { label: 'Da empresa', cls: 'bg-brand-500 text-white border-brand-500' },
  fabrica: { label: 'De fábrica', cls: 'bg-mist-100 text-brand-700 border-brand-300' },
  padrao: { label: 'Padrão do sistema', cls: 'bg-white text-stone-500 border-stone-300' },
  nenhum: { label: 'Não acompanhado', cls: 'bg-amber-50 text-amber-700 border-amber-300' },
}

export function OrigemIntervaloBadge({ origem }) {
  return <Etiqueta opcoes={ORIGEM} valor={origem} padrao="nenhum" />
}
