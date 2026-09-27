import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Button } from '../ui/Form'
import { paisService } from '../../services'

export default function PaisModal({ open, onClose, registro, onSalvo }) {
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    setNome(registro?.nome ?? '')
    setErro('')
  }, [open, registro])

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
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
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
        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </form>
    </Modal>
  )
}
