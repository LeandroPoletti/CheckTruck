import { useState } from 'react'
import { Check } from 'lucide-react'
import { Modal } from '../ui/Overlay'
import { Button, MensagemErro } from '../ui/Form'
import { TEMAS } from '../../data/temas'
import { obterUsuario, trocarTema } from '../../services/sessao'

// Escolha da cor do sistema: muda na hora e fica na conta da pessoa (o app muda junto)
export default function CorModal({ onClose }) {
  const [tema, setTema] = useState(() => obterUsuario()?.tema ?? 'Verde')
  const [salvando, setSalvando] = useState(null)
  const [erro, setErro] = useState('')

  async function escolher(id) {
    if (id === tema || salvando) return
    setSalvando(id)
    setErro('')
    try {
      await trocarTema(id)
      setTema(id)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(null)
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Cor do sistema"
      subtitle="Vale para você, no site e no app."
      width="max-w-md"
      footer={<Button onClick={onClose}>Pronto</Button>}
    >
      <div className="grid grid-cols-2 gap-3">
        {TEMAS.map((t) => {
          const escolhido = t.id === tema
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => escolher(t.id)}
              aria-pressed={escolhido}
              className={`overflow-hidden rounded-xl border-2 text-left transition ${
                escolhido ? 'border-brand-700 ring-2 ring-brand-200' : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <span className="flex h-16 items-end gap-1.5 px-3 pb-3" style={{ backgroundColor: t.topo }}>
                {[1, 0.7, 0.4].map((o) => <span key={o} className="h-1.5 w-6 rounded-full" style={{ backgroundColor: t.destaque, opacity: o }} />)}
              </span>
              <span className="flex items-center justify-between px-3 py-2.5 font-semibold text-stone-800">
                {salvando === t.id ? 'Salvando…' : t.nome}
                {escolhido && <Check size={18} className="text-brand-700" strokeWidth={3} />}
              </span>
            </button>
          )
        })}
      </div>
      <MensagemErro className="mt-4">{erro}</MensagemErro>
    </Modal>
  )
}
