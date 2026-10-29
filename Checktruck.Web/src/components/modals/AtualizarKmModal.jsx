import { useState } from 'react'
import { veiculoService } from '../../services'
import { Modal } from '../ui/Overlay'
import { Field, Input, Button } from '../ui/Form'
import { formatKm } from '../../data/domain'

// Lançar o km novo do caminhão.
export default function AtualizarKmModal({ onClose, veiculo, onSalvo }) {
  const [km, setKm] = useState(String(veiculo.kmAtual))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit() {
    const valor = Number(km)
    // O km só sobe (RN-02)
    if (!Number.isInteger(valor) || valor <= veiculo.kmAtual) {
      setErro(`Informe um km maior que o atual (${formatKm(veiculo.kmAtual)}). Se o atual está errado, peça para o Admin ou o Gestor usar Corrigir km.`)
      return
    }
    setSalvando(true)
    try {
      await veiculoService.atualizarKm(veiculo.id, valor)
      onSalvo?.(valor)
      onClose()
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      onClose={onClose}
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
      <Field label="Km atual" required error={erro} hint={!erro ? `Atual registrado: ${formatKm(veiculo.kmAtual)}` : undefined}>
        <Input type="number" min={veiculo.kmAtual + 1} value={km} onChange={(e) => setKm(e.target.value)} error={!!erro} autoFocus />
      </Field>
    </Modal>
  )
}
