import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Toggle, Button } from '../ui/Form'
import { formatKm } from '../../data/domain'

export default function RegistrarManutencaoModal({ open, onClose, veiculo }) {
  const { registros, tecnicos, addRegistroManutencao, getIntervalosDoModelo, getUltimoRegistro, getTipoManutencao } = useApp()
  const [tipoId, setTipoId] = useState('')
  const [tecnicoId, setTecnicoId] = useState('')
  const [kmNaTroca, setKmNaTroca] = useState('')
  const [dataRealizacao, setDataRealizacao] = useState(() => new Date().toISOString().slice(0, 10))
  const [isPrimeiraTroca, setIsPrimeiraTroca] = useState(false)
  const [nrNotaFiscal, setNrNotaFiscal] = useState('')
  const [concessionaria, setConcessionaria] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (open && veiculo) {
      setTipoId('')
      setTecnicoId('')
      setKmNaTroca(String(veiculo.kmAtual))
      setDataRealizacao(new Date().toISOString().slice(0, 10))
      setIsPrimeiraTroca(false)
      setNrNotaFiscal('')
      setConcessionaria('')
      setObservacoes('')
      setError('')
    }
  }, [open, veiculo])

  if (!veiculo) return null

  const intervalosDoModelo = getIntervalosDoModelo(veiculo.modeloId)
  const intervaloSelecionado = intervalosDoModelo.find((i) => i.tipoId === tipoId)
  const ultimo = tipoId ? getUltimoRegistro(veiculo.id, tipoId, registros) : null
  const sugerePrimeira = tipoId && !ultimo

  async function handleSubmit() {
    const km = Number(kmNaTroca)
    if (!tipoId) { setError('Selecione o tipo de manutenção.'); return }
    if (!tecnicoId) { setError('Selecione o técnico responsável.'); return }
    if (!concessionaria.trim() || !nrNotaFiscal.trim()) {
      setError('Informe a concessionária/oficina e o nº da nota fiscal.')
      return
    }
    if (!Number.isFinite(km) || km < veiculo.kmAtual) {
      setError(`Km na troca deve ser maior ou igual ao km atual do veículo (${formatKm(veiculo.kmAtual)}).`)
      return
    }
    const usaPrimeira = isPrimeiraTroca || sugerePrimeira
    const intervaloAplicado = usaPrimeira
      ? (intervaloSelecionado?.intervaloKmPrimeira ?? intervaloSelecionado?.intervaloKm ?? 0)
      : (intervaloSelecionado?.intervaloKm ?? 0)

    setSalvando(true)
    try {
      await addRegistroManutencao({
        veiculoId: veiculo.id,
        tipoId,
        tecnicoId,
        kmNaTroca: km,
        kmProximaTroca: km + intervaloAplicado,
        dataRealizacao,
        isPrimeiraTroca: usaPrimeira,
        nrNotaFiscal: nrNotaFiscal.trim(),
        concessionaria: concessionaria.trim(),
        observacoes: observacoes.trim() || null,
      })
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
      eyebrow="POST /api/Manutencao"
      title="Registrar manutenção"
      subtitle={veiculo.placa}
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={salvando}>{salvando ? 'Registrando…' : 'Registrar manutenção'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Tipo de manutenção" required>
          <Select value={tipoId} onChange={(e) => setTipoId(e.target.value)}>
            <option value="">Selecione</option>
            {intervalosDoModelo.map((it) => (
              <option key={it.tipoId} value={it.tipoId}>{getTipoManutencao(it.tipoId)?.nome}</option>
            ))}
          </Select>
          {intervaloSelecionado && (
            <p className="mt-1.5 text-xs text-stone-400">
              Intervalo padrão {formatKm(intervaloSelecionado.intervaloKm)}
              {intervaloSelecionado.intervaloKmPrimeira && <> · 1ª troca {formatKm(intervaloSelecionado.intervaloKmPrimeira)}</>}
            </p>
          )}
        </Field>

        <Field label="Técnico responsável" required>
          <Select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
            <option value="">Selecione</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>CPF {t.cpf}</option>
            ))}
          </Select>
          {tecnicos.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600">Nenhum técnico cadastrado na API.</p>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Km na troca" required>
            <Input type="number" value={kmNaTroca} onChange={(e) => setKmNaTroca(e.target.value)} />
          </Field>
          <Field label="Data da realização" required>
            <Input type="date" value={dataRealizacao} onChange={(e) => setDataRealizacao(e.target.value)} />
          </Field>
        </div>

        <Toggle
          checked={isPrimeiraTroca || sugerePrimeira}
          onChange={setIsPrimeiraTroca}
          label={sugerePrimeira ? 'Primeira troca (sugerido — sem histórico anterior)' : 'Marcar como primeira troca (amaciamento)'}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Concessionária / oficina" required>
            <Input value={concessionaria} onChange={(e) => setConcessionaria(e.target.value)} placeholder="Volvo Bauru" />
          </Field>
          <Field label="Nº nota fiscal" required>
            <Input value={nrNotaFiscal} onChange={(e) => setNrNotaFiscal(e.target.value)} placeholder="118.442" />
          </Field>
        </div>

        <Field label="Observações">
          <Input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Opcional" />
        </Field>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>
    </Modal>
  )
}
