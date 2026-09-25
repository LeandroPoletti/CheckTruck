import { X } from 'lucide-react'

export function Modal({ open, onClose, title, subtitle, eyebrow, width = 'max-w-2xl', children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-4">
      <div className="fixed inset-0 bg-stone-900/50" onClick={onClose} />
      <div className={`relative z-10 w-full ${width} rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-start justify-between border-b border-stone-100 px-6 py-5">
          <div>
            {eyebrow && <p className="text-xs font-mono-label text-brand-600 mb-1">{eyebrow}</p>}
            <h2 className="text-lg font-bold text-stone-900">{title}</h2>
            {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 rounded-lg p-1">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-stone-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, subtitle, eyebrow, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-stone-900/50" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-stone-100 px-6 py-5">
          <div>
            {eyebrow && <p className="text-xs font-mono-label text-brand-600 mb-1">{eyebrow}</p>}
            <h2 className="text-lg font-bold text-stone-900">{title}</h2>
            {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 rounded-lg p-1">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-stone-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
