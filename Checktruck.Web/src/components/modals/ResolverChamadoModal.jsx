import { useState } from 'react'
import { chamadoService } from '../../services'
import { Modal } from '../ui/Overlay'
import { Field, Textarea, Button } from '../ui/Form'

// Concluir o chamado contando o que foi feito (obrigatório: fica no histórico do caminhão).
export default function ResolverChamadoModal({ chamado, onClose, onSalvo }) {
  const [solucao, setSolucao] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function resolver() {
    if (!solucao.trim()) {
      setErro('Conte o que foi feito.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      await chamadoService.resolver(chamado.id, solucao)
      onSalvo()
      onClose()
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Resolver chamado"
      subtitle={`Caminhão ${chamado.placa}`}
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={resolver} disabled={salvando}>{salvando ? 'Salvando…' : 'Marcar como resolvido'}</Button>
        </>
      }
    >
      <Field label="O que foi feito?" required>
        <Textarea
          rows={4}
          value={solucao}
          onChange={(e) => setSolucao(e.target.value)}
          placeholder="Ex.: trocada a lona de freio traseira e regulado o tambor"
        />
      </Field>
      {erro && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
    </Modal>
  )
}
