import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Toggle, Button } from '../ui/Form'
import { formatKm, getUltimoRegistro } from '../../data/domain'
import {
  manutencaoService, tipoManutencaoService, intervaloService, mecanicoService, filtro,
} from '../../services'
import MecanicoModal from './MecanicoModal'
import { obterUsuario } from '../../services/sessao'
import { pode } from '../../data/acesso'

const LISTAS_VAZIAS = { tiposManutencao: [], intervalos: [], registros: [], mecanicos: [] }

export default function RegistrarManutencaoModal({ open, onClose, veiculo, onSalvo }) {
  const podeCadastrarMecanico = pode(obterUsuario(), 'Cadastros')
  const [listas, setListas] = useState(LISTAS_VAZIAS)
  const [carregando, setCarregando] = useState(false)
  const [erroCarga, setErroCarga] = useState(null)
  const { tiposManutencao, intervalos, registros, mecanicos } = listas
  const [tipoId, setTipoId] = useState('')
  const [mecanicoId, setMecanicoId] = useState('')
  const [novoMecanicoOpen, setNovoMecanicoOpen] = useState(false)
  const [kmNaTroca, setKmNaTroca] = useState('')
  const [dataRealizacao, setDataRealizacao] = useState(() => new Date().toISOString().slice(0, 10))
  const [isPrimeiraTroca, setIsPrimeiraTroca] = useState(false)
  const [nrNotaFiscal, setNrNotaFiscal] = useState('')
  const [concessionaria, setConcessionaria] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [registrado, setRegistrado] = useState(false) // POST ok, mas falhou o km: não reenviar

  useEffect(() => {
    if (open && veiculo) {
      setTipoId('')
      setMecanicoId('')
      setKmNaTroca(String(veiculo.kmAtual))
      setDataRealizacao(new Date().toISOString().slice(0, 10))
      setIsPrimeiraTroca(false)
      setNrNotaFiscal('')
      setConcessionaria('')
      setObservacoes('')
      setError('')
      setRegistrado(false)
    }
  }, [open, veiculo])

  // Ao abrir: tipos, intervalos do modelo, histórico do veículo (para sugerir 1ª troca) e mecânicos
  useEffect(() => {
    if (!open || !veiculo) return
    let cancelado = false
    setErroCarga(null)
    setCarregando(true)
    Promise.all([
      tipoManutencaoService.listar(),
      intervaloService.listar(filtro.porId('Modelo', veiculo.modeloId)),
      manutencaoService.listar(filtro.porId('Veiculo', veiculo.id)),
      mecanicoService.listar(filtro.ativos()),
    ])
      .then(([tiposManutencao, intervalos, registros, mecanicos]) => {
        if (!cancelado) setListas({ tiposManutencao, intervalos, registros, mecanicos })
      })
      .catch((e) => { if (!cancelado) setErroCarga(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [open, veiculo])

  if (!veiculo) return null

  const intervaloSelecionado = intervalos.find((i) => i.tipoId === tipoId) // já filtrados pelo modelo
  const ultimo = tipoId ? getUltimoRegistro(veiculo.id, tipoId, registros) : null
  const sugerePrimeira = tipoId && !ultimo
  const mecanicosOrdenados = [...mecanicos].sort((a, b) => a.nome.localeCompare(b.nome))

  // Mecânico cadastrado aqui mesmo: entra na lista e já fica selecionado
  function handleMecanicoCriado(novo) {
    if (!novo) return
    setListas((l) => ({ ...l, mecanicos: [...l.mecanicos, novo] }))
    setMecanicoId(novo.id)
  }

  async function handleSubmit() {
    const km = Number(kmNaTroca)
    if (!tipoId) { setError('Selecione o tipo de manutenção.'); return }
    if (!mecanicoId) { setError('Escolha o mecânico que fez a troca.'); return }
    if (!nrNotaFiscal.trim()) { setError('Informe o nº da OS ou da nota fiscal.'); return }
    // OS antiga pode ter km menor que o atual; só não aceita km inválido
    if (!Number.isFinite(km) || km < 0) { setError('Informe o km do caminhão na troca.'); return }

    setSalvando(true)
    try {
      // Próxima troca (km e data) em branco: a API calcula pelo intervalo do caminhão → modelo → padrão.
      // O km da OS também atualiza o km do caminhão na API quando é maior que o atual.
      await manutencaoService.criar({
        veiculoId: veiculo.id,
        tipoId,
        mecanicoId,
        kmNaTroca: km,
        kmProximaTroca: 0,
        dataProximaTroca: null,
        dataRealizacao,
        isPrimeiraTroca: isPrimeiraTroca || sugerePrimeira,
        nrNotaFiscal: nrNotaFiscal.trim(),
        concessionaria: concessionaria.trim() || null,
        observacoes: observacoes.trim() || null,
      })
      setRegistrado(true)
      onSalvo?.()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
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
          <Button onClick={handleSubmit} disabled={salvando || registrado || carregando || !!erroCarga}>{salvando ? 'Registrando…' : 'Registrar manutenção'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {carregando && <p className="text-sm text-stone-400">Carregando tipos, intervalos e mecânicos…</p>}
        {erroCarga && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroCarga}</p>}
        <Field label="Tipo de manutenção" required>
          <Select value={tipoId} onChange={(e) => setTipoId(e.target.value)}>
            <option value="">Selecione</option>
            {tiposManutencao.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </Select>
          <p className="mt-1.5 text-xs text-stone-400">
            {intervaloSelecionado
              ? <>Intervalo do modelo {formatKm(intervaloSelecionado.intervaloKm)}</>
              : 'A próxima troca é calculada pelo intervalo do caminhão, do modelo ou pelo padrão.'}
          </p>
        </Field>

        <Field label="Mecânico" required>
          <div className="flex gap-2">
            <Select value={mecanicoId} onChange={(e) => setMecanicoId(e.target.value)} className="flex-1">
              <option value="">Selecione quem fez a troca</option>
              {mecanicosOrdenados.map((m) => (
                <option key={m.id} value={m.id}>{m.nome} — {m.funcao}</option>
              ))}
            </Select>
            {podeCadastrarMecanico && (
              <Button type="button" variant="secondary" onClick={() => setNovoMecanicoOpen(true)}>+ Novo</Button>
            )}
          </div>
          {!carregando && mecanicos.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600">
              {podeCadastrarMecanico ? 'Nenhum mecânico cadastrado. Use “+ Novo” para cadastrar.' : 'Nenhum mecânico cadastrado. Peça para quem cuida dos cadastros.'}
            </p>
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
          <Field label="Concessionária / oficina">
            <Input value={concessionaria} onChange={(e) => setConcessionaria(e.target.value)} placeholder="Opcional" />
          </Field>
          <Field label="Nº da OS / nota fiscal" required>
            <Input value={nrNotaFiscal} onChange={(e) => setNrNotaFiscal(e.target.value)} placeholder="118.442" />
          </Field>
        </div>

        <Field label="Observações">
          <Input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Opcional" />
        </Field>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>
    </Modal>
    {/* Fora do modal da OS para abrir por cima dele */}
    <MecanicoModal open={novoMecanicoOpen} onClose={() => setNovoMecanicoOpen(false)} onSalvo={handleMecanicoCriado} />
    </>
  )
}
