import { useEffect, useState } from 'react'
import { veiculoService } from '../../services'
import { Modal } from '../ui/Overlay'
import { Field, Input, Button } from '../ui/Form'
import { formatKm } from '../../data/domain'

export default function AtualizarKmModal({ open, onClose, veiculo, onSalvo }) {
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
    // O km só sobe (RN-02): a API recebe quanto o caminhão rodou, e precisa ser mais que zero
    if (!Number.isInteger(valor) || valor <= veiculo.kmAtual) {
      setError(`Informe um km maior que o atual (${formatKm(veiculo.kmAtual)}). Se o atual está errado, peça para o Admin ou o Gestor usar Corrigir km.`)
      return
    }
    setSalvando(true)
    try {
      // A API recebe a distância percorrida, não o km absoluto
      await veiculoService.somarKm(veiculo.id, valor - veiculo.kmAtual)
      onSalvo?.(valor)
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
        <Input type="number" min={veiculo.kmAtual + 1} value={km} onChange={(e) => setKm(e.target.value)} error={!!error} autoFocus />
      </Field>
    </Modal>
  )
}
