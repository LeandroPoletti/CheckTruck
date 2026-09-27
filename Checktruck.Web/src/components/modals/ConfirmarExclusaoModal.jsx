import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Button } from '../ui/Form'

// Confirmação genérica de exclusão. onConfirmar faz o DELETE; se a API recusar
// (ex.: registro em uso), a mensagem aparece aqui e o modal continua aberto.
export default function ConfirmarExclusaoModal({ open, onClose, titulo, descricao, onConfirmar }) {
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (open) setErro('')
  }, [open])

  async function handleConfirmar() {
    setExcluindo(true)
    setErro('')
    try {
      await onConfirmar()
      onClose()
    } catch (e) {
      setErro(e.message)
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titulo}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmar} disabled={excluindo}>
            {excluindo ? 'Excluindo…' : 'Excluir'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-stone-600">{descricao}</p>
      {erro && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
    </Modal>
  )
}
