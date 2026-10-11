import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Button, MensagemErro } from '../ui/Form'

// Confirmação genérica de exclusão. onConfirmar faz o DELETE; se a API recusar
// (ex.: registro em uso), a mensagem aparece aqui e o modal continua aberto.
export default function ConfirmarExclusaoModal({ onClose, titulo, descricao, onConfirmar, rotulo = 'Excluir' }) {
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')

  async function handleConfirmar() {
    setExcluindo(true)
    setErro('')
    try {
      await onConfirmar()
      onClose()
    } catch (e) {
      setErro(e.message)
      setExcluindo(false)
    }
  }

  return (
    <Modal
      onClose={onClose}
      title={titulo}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmar} disabled={excluindo}>
            {excluindo ? 'Aguarde…' : rotulo}
          </Button>
        </>
      }
    >
      <p className="text-sm text-stone-600">{descricao}</p>
      <MensagemErro className="mt-4">{erro}</MensagemErro>
    </Modal>
  )
}
