import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Button, MensagemErro } from '../ui/Form'
import { paisService } from '../../services'

// Novo país (registro = null) ou editar um.
export default function PaisModal({ onClose, registro, onSalvo }) {
  const [nome, setNome] = useState(registro?.nome ?? '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome do país.'); return }
    setSalvando(true)
    setErro('')
    try {
      const dados = { nome: nome.trim() }
      const salvo = registro ? await paisService.atualizar(registro.id, dados) : await paisService.criar(dados)
      onSalvo?.(salvo)
      onClose()
    } catch (err) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      onClose={onClose}
      eyebrow={registro ? 'PUT /api/Pais/{id}' : 'POST /api/Pais'}
      title={registro ? 'Editar país' : 'Novo país'}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome" required>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Suécia" autoFocus />
        </Field>
        <MensagemErro>{erro}</MensagemErro>
      </form>
    </Modal>
  )
}
