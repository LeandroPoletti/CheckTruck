import { useEffect, useState } from 'react'
import { chamadoService, veiculoService, filtro } from '../../services'
import { obterUsuario } from '../../services/sessao'
import { Modal } from '../ui/Overlay'
import { Field, Select, Textarea, Button } from '../ui/Form'

const TIPOS = [
  'Ruído no motor',
  'Freios',
  'Pneu / suspensão',
  'Elétrica / painel',
  'Vazamento',
  'Ar-condicionado',
  'Manutenção preventiva vencida',
  'Outro',
]

export default function NovoChamadoModal({ open, onClose, veiculo, onSalvo }) {
  const user = obterUsuario()
  const [veiculos, setVeiculos] = useState([])
  const [tipo, setTipo] = useState(TIPOS[0])
  const [urgencia, setUrgencia] = useState('media')
  const [descricao, setDescricao] = useState('')
  const [veiculoId, setVeiculoId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setTipo(TIPOS[0])
      setUrgencia('media')
      setDescricao('')
      setVeiculoId(veiculo?.id || '')
      setError('')
    }
  }, [open, veiculo])

  // Sem veículo definido pela página: carrega os ativos para o usuário escolher
  useEffect(() => {
    if (!open || veiculo) return
    let cancelado = false
    veiculoService.listar(filtro.ativos())
      .then((lista) => { if (!cancelado) setVeiculos(lista) })
      .catch((e) => { if (!cancelado) setError(`Não foi possível carregar os veículos: ${e.message}`) })
    return () => { cancelado = true }
  }, [open, veiculo])

  async function handleSubmit() {
    if (!descricao.trim()) {
      setError('Descreva o que está acontecendo.')
      return
    }
    try {
      const chamado = await chamadoService.criar({
        veiculoId: veiculo?.id || veiculoId || null,
        abertoPorId: user.id,
        tipo,
        urgencia,
        descricao: descricao.trim(),
      })
      onSalvo?.(chamado)
      onClose()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="POST /api/Chamado (pendente na API)"
      title="Abrir chamado"
      subtitle={veiculo ? `Veículo ${veiculo.placa}` : 'Selecione o motivo do chamado'}
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Enviar chamado</Button>
        </>
      }
    >
      <div className="space-y-4">
        {!veiculo && (
          <Field label="Veículo" required>
            <Select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
              <option value="">Selecione o veículo</option>
              {veiculos.map((v) => (
                <option key={v.id} value={v.id}>{v.placa}</option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Tipo de ocorrência" required>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>

        <Field label="Urgência" required>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: 'baixa', label: 'Baixa' },
              { v: 'media', label: 'Média' },
              { v: 'alta', label: 'Urgente' },
            ].map((op) => (
              <button
                key={op.v}
                type="button"
                onClick={() => setUrgencia(op.v)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  urgencia === op.v ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-stone-300 text-stone-500'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="O que aconteceu?" required error={error}>
          <Textarea
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o problema: quando começou, sintomas, condições da via..."
            error={!!error}
          />
        </Field>

        <p className="rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-brand-800">
          O chamado cai automaticamente para o gerente e para a equipe de manutenção.
        </p>
      </div>
    </Modal>
  )
}
