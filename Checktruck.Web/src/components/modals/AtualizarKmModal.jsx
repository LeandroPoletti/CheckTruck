import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Modal } from '../ui/Overlay'
import { Field, Input, Button } from '../ui/Form'
import { formatKm } from '../../data/domain'

export default function AtualizarKmModal({ open, onClose, veiculo }) {
  const { atualizarKm } = useApp()
  const [km, setKm] = useState('')
  const [error, setError] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (open && veiculo) {
      setKm(String(veiculo.kmAtual))
      setError('')
    }
  }, [open, veiculo])

  if (!veiculo) return null

  async function handleSubmit() {
    const valor = Number(km)
    if (!Number.isFinite(valor) || valor < veiculo.kmAtual) {
      setError(`Km atual nunca pode diminuir (RN-02). Valor mínimo: ${formatKm(veiculo.kmAtual)}.`)
      return
    }
    setSalvando(true)
    try {
      await atualizarKm(veiculo.id, valor)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={`PUT /api/Veiculo/${veiculo.id}/kilometragem`}
      title="Atualizar quilometragem"
      subtitle={veiculo.placa}
      width="max-w-sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <Field label="Km atual" required error={error} hint={!error ? `Atual registrado: ${formatKm(veiculo.kmAtual)}` : undefined}>
        <Input type="number" value={km} onChange={(e) => setKm(e.target.value)} error={!!error} autoFocus />
      </Field>
    </Modal>
  )
}
