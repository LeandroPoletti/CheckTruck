import { useRef } from 'react'
import { Search } from 'lucide-react'

// group: o campo tem vários controles dentro (ex.: etiquetas com ×). Aí ele não pode ser um <label>,
// senão clicar no meio do campo aciona o primeiro botão de dentro.
export function Field({ label, required, hint, error, group = false, children, className = '' }) {
  const Elemento = group ? 'div' : 'label'
  return (
    <Elemento className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-stone-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </Elemento>
  )
}

const inputBase =
  'rounded-lg border bg-white px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition focus:ring-2 focus:ring-brand-300 disabled:bg-stone-50 disabled:text-stone-500'

// Os campos ocupam a largura toda, a não ser que a tela passe uma largura (w-56, w-64...).
// Com as duas classes juntas o w-full sempre ganharia, e o filtro espremia a busca ao lado.
const largura = (className) => (/(^|\s)w-/.test(className) ? '' : 'w-full')

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`${inputBase} ${largura(className)} ${error ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:border-brand-500'} ${className}`}
      {...props}
    />
  )
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`${inputBase} ${largura(className)} resize-none ${error ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:border-brand-500'} ${className}`}
      {...props}
    />
  )
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`${inputBase} ${largura(className)} appearance-none bg-white ${error ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:border-brand-500'} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className="inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={`relative h-6 w-10 rounded-full transition ${checked ? 'bg-brand-600' : 'bg-stone-300'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-4' : 'left-0.5'}`}
        />
      </span>
      {label && <span className="text-sm text-stone-700">{label}</span>}
    </button>
  )
}

// Os botões têm uma sombra embaixo (parecem uma tecla) para ninguém confundir com texto; ao clicar, "afundam"
export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-brand-700 text-white shadow-[0_3px_0_var(--color-brand-900)] hover:bg-brand-800 disabled:bg-stone-300 disabled:shadow-none',
    secondary: 'border border-stone-300 bg-white text-stone-800 shadow-[0_3px_0_var(--color-stone-300)] hover:bg-stone-50',
    danger: 'bg-red-600 text-white shadow-[0_3px_0_var(--color-red-800)] hover:bg-red-700',
    dangerLight: 'border border-red-200 bg-white text-red-700 shadow-[0_3px_0_var(--color-red-200)] hover:bg-red-50',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:active:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Erro do formulário ou da ação (ex.: o que a API respondeu). Sem mensagem, não mostra nada.
export function MensagemErro({ className = '', children }) {
  if (!children) return null
  return <p className={`rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 ${className}`}>{children}</p>
}

// Campo de busca das listas. Clicar na lupa põe o cursor no campo; onChange recebe o texto digitado.
export function CampoBusca({ value, onChange, placeholder, className = '' }) {
  const campo = useRef(null)
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => campo.current?.focus()}
        aria-label="Buscar"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-600"
      >
        <Search size={18} />
      </button>
      <Input ref={campo} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-10" />
    </div>
  )
}
