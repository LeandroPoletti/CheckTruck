import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { contemBusca } from '../../data/domain'

// Escolher vários de uma lista: os escolhidos viram etiquetas com × para tirar. Clicar na caixa abre a lista,
// e o que for digitado filtra as opções (Enter pega a primeira; Backspace com a busca vazia tira a última).
// opcoes: [{ id, nome }]; selecionados: os ids, na ordem em que entraram.
export function SelecaoMultipla({ opcoes, selecionados, onChange, placeholder = 'Escolher…' }) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const caixa = useRef(null)
  const campo = useRef(null)

  const escolhidos = selecionados.map((id) => opcoes.find((o) => o.id === id)).filter(Boolean)
  const disponiveis = opcoes.filter((o) => !selecionados.includes(o.id) && contemBusca(o.nome, busca))

  // Clicar fora fecha a lista
  useEffect(() => {
    if (!aberto) return
    function fecharSeForFora(e) {
      if (!caixa.current?.contains(e.target)) fechar()
    }
    document.addEventListener('mousedown', fecharSeForFora)
    return () => document.removeEventListener('mousedown', fecharSeForFora)
  }, [aberto])

  function fechar() {
    setAberto(false)
    setBusca('')
  }

  function adicionar(id) {
    onChange([...selecionados, id])
    setBusca('')
    campo.current?.focus()
  }

  function tirar(id) {
    onChange(selecionados.filter((s) => s !== id))
  }

  function teclar(e) {
    if (e.key === 'Escape') {
      fechar()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (disponiveis[0]) adicionar(disponiveis[0].id)
    } else if (e.key === 'Backspace' && busca === '' && selecionados.length > 0) {
      tirar(selecionados.at(-1))
    }
  }

  return (
    <div ref={caixa} className="relative">
      <div
        onClick={() => campo.current?.focus()}
        className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2 py-1.5 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-300"
      >
        {escolhidos.map((o) => (
          <span key={o.id} className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 py-0.5 pl-2 pr-1 text-sm text-brand-800">
            {o.nome}
            <button
              type="button"
              aria-label={`Tirar ${o.nome}`}
              onClick={(e) => {
                e.stopPropagation()
                tirar(o.id)
              }}
              className="rounded p-0.5 text-brand-600 transition hover:bg-brand-100 hover:text-brand-900"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          ref={campo}
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setAberto(true)
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={teclar}
          placeholder={escolhidos.length === 0 ? placeholder : ''}
          className="min-w-20 flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-stone-800 outline-none placeholder:text-stone-400"
        />
        <ChevronDown size={16} className={`shrink-0 text-stone-400 transition ${aberto ? 'rotate-180' : ''}`} />
      </div>

      {aberto && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
          {disponiveis.length === 0 ? (
            <li className="px-3 py-2 text-sm text-stone-400">
              {opcoes.length > 0 && opcoes.length === selecionados.length ? 'Todos já foram escolhidos.' : 'Nada encontrado.'}
            </li>
          ) : (
            disponiveis.map((o) => (
              <li key={o.id}>
                {/* mousedown não tira o foco do campo: a lista continua aberta para escolher o próximo */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => adicionar(o.id)}
                  className="w-full px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-brand-50"
                >
                  {o.nome}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
