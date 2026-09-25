export function Field({ label, required, hint, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-[11px] font-semibold tracking-wide text-brand-800/70 mb-1.5">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="block text-xs text-stone-400 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition focus:ring-2 focus:ring-brand-300'

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`${inputBase} ${error ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:border-brand-500'} ${className}`}
      {...props}
    />
  )
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`${inputBase} resize-none ${error ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:border-brand-500'} ${className}`}
      {...props}
    />
  )
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`${inputBase} appearance-none bg-white ${error ? 'border-red-400 focus:ring-red-200' : 'border-stone-300 focus:border-brand-500'} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
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

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-brand-700 text-white hover:bg-brand-800 disabled:bg-stone-300',
    secondary: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50',
    ghost: 'bg-transparent text-brand-800 hover:bg-brand-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
