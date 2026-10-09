import { useState } from 'react'
import { veiculoService } from '../../services'
import { Modal } from '../ui/Overlay'
import { Field, Input, Button } from '../ui/Form'
import { formatKm } from '../../data/domain'

// Só Admin e Gestor: corrige um km digitado errado (ex.: um zero a mais). Pode baixar o km, mas não
// para menos que o km da maior OS do caminhão (kmMaiorOs). Quem abre a tela só renderiza este modal aberto.
export default function CorrigirKmModal({ veiculo, kmMaiorOs, onClose, onSalvo }) {
  const [km, setKm] = useState(String(veiculo.kmAtual))
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const minimo = kmMaiorOs ?? 0

  async function salvar() {
    const valor = Number(km)
    if (km === '' || !Number.isInteger(valor) || valor < 0) { setErro('Informe o km certo (sem negativo).'); return }
    if (valor === veiculo.kmAtual) { setErro('O caminhão já está com esse km.'); return }
    if (valor < minimo) { setErro(`A maior OS deste caminhão é de ${formatKm(minimo)}. Use um km a partir desse ou corrija a OS antes.`); return }
    if (!motivo.trim()) { setErro('Informe o motivo da correção (ex.: zero a mais).'); return }

    setSalvando(true)
    setErro('')
    try {
      await veiculoService.corrigirKm(veiculo.id, valor, motivo)
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
      eyebrow={`PUT /api/Veiculo/${veiculo.id}/corrigir-km`}
      title="Corrigir km"
      subtitle={`${veiculo.placa} · hoje com ${formatKm(veiculo.kmAtual)}`}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar correção'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="rounded-lg bg-mist-100 px-3 py-2 text-xs text-brand-800">
          Para km digitado errado (ex.: um zero a mais). A correção fica no histórico de km com o seu nome e o motivo.
        </p>
        <Field label="Km certo" required hint={minimo > 0 ? `Mínimo ${formatKm(minimo)} (maior OS deste caminhão)` : undefined}>
          <Input type="number" min={minimo} value={km} onChange={(e) => setKm(e.target.value)} autoFocus />
        </Field>
        <Field label="Motivo" required>
          <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={200} placeholder="Ex.: zero a mais no Atualizar km" />
        </Field>
        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </div>
    </Modal>
  )
}
