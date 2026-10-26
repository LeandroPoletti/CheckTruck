import { X } from 'lucide-react'

// Modal e Drawer não têm "aberto/fechado": quem usa só renderiza quando abre ({aberto && <XModal />}).
// Assim o formulário nasce com os dados certos e some (com o estado dele) ao fechar.
// Os botões de baixo vão para a linha de baixo quando não cabem lado a lado (tela pequena), em vez de vazar.
export function Modal({ onClose, title, subtitle, width = 'max-w-2xl', children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-4">
      <div className="fixed inset-0 bg-stone-900/50" onClick={onClose} />
      <div className={`relative z-10 w-full ${width} rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-start justify-between border-b border-stone-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800">
            <X size={22} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function Drawer({ onClose, title, subtitle, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-stone-900/50" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-stone-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
