import { useEffect, useMemo, useState } from 'react'
import { useApp, useDominio } from '../../context/AppContext'
import { Drawer } from '../ui/Overlay'
import { Field, Input, Select, Toggle, Button } from '../ui/Form'
import { nomePessoa } from '../../data/domain'

const empty = {
  fabricanteId: '',
  geracaoId: '',
  modeloId: '',
  placa: '',
  chassi: '',
  renavam: '',
  anoFabricacao: '',
  anoModelo: '',
  kmAtual: '',
  motoristaId: '',
  ativo: true,
}

export default function NovoVeiculoModal({ open, onClose, veiculoParaEditar }) {
  const { fabricantes, geracoes, modelos, motoristas, addVeiculo, updateVeiculo } = useApp()
  const { getModeloCompleto } = useDominio()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    if (veiculoParaEditar) {
      const mc = getModeloCompleto(veiculoParaEditar.modeloId)
      setForm({
        fabricanteId: mc?.fabricante?.id || '',
        geracaoId: mc?.geracao?.id || '',
        modeloId: veiculoParaEditar.modeloId,
        placa: veiculoParaEditar.placa,
        chassi: veiculoParaEditar.chassi || '',
        renavam: veiculoParaEditar.renavam || '',
        anoFabricacao: veiculoParaEditar.anoFabricacao ?? '',
        anoModelo: veiculoParaEditar.anoModelo ?? '',
        kmAtual: veiculoParaEditar.kmAtual,
        motoristaId: veiculoParaEditar.motoristaId || '',
        ativo: veiculoParaEditar.ativo,
      })
    } else {
      setForm(empty)
    }
    setErrors({})
    setErroApi('')
  }, [open, veiculoParaEditar, getModeloCompleto])

  const geracoesDoFabricante = useMemo(
    () => geracoes.filter((g) => g.fabricanteId === form.fabricanteId),
    [geracoes, form.fabricanteId]
  )
  const modelosDaGeracao = useMemo(
    () => modelos.filter((m) => m.geracaoId === form.geracaoId),
    [modelos, form.geracaoId]
  )
  const modeloSelecionado = modelos.find((m) => m.id === form.modeloId)
  const geracaoSelecionada = geracoes.find((g) => g.id === form.geracaoId)

  // Motorista ↔ veículo é 1:1 na API: só lista quem está livre (ou o motorista atual do veículo)
  const motoristasDisponiveis = motoristas.filter(
    (m) => m.ativo && (!m.veiculoId || m.veiculoId === veiculoParaEditar?.id)
  )

  function set(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'fabricanteId') { next.geracaoId = ''; next.modeloId = '' }
      if (field === 'geracaoId') { next.modeloId = '' }
      return next
    })
  }

  function validate() {
    const e = {}
    if (!form.modeloId) e.modeloId = 'Selecione o modelo.'
    if (!form.placa.trim()) e.placa = 'Placa é obrigatória.'
    if (form.chassi.length !== 17) e.chassi = `${form.chassi.length} de 17 caracteres`
    if (!form.renavam.trim()) e.renavam = 'Renavam é obrigatório.'
    // A API exige motorista em todo veículo (VeiculoRequestDto.MotoristaId é [Required])
    if (!form.motoristaId) e.motoristaId = 'Selecione o motorista (obrigatório na API).'
    if (veiculoParaEditar && Number(form.kmAtual) < veiculoParaEditar.kmAtual) {
      e.kmAtual = 'Km atual nunca pode diminuir (RN-02).'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(fecharDepois) {
    if (!validate()) return
    const payload = {
      modeloId: form.modeloId,
      placa: form.placa.trim().toUpperCase(),
      chassi: form.chassi.trim(),
      renavam: form.renavam.trim(),
      anoFabricacao: Number(form.anoFabricacao) || null,
      anoModelo: Number(form.anoModelo) || null,
      kmAtual: Number(form.kmAtual) || 0,
      motoristaId: form.motoristaId,
      ativo: form.ativo,
    }
    setSalvando(true)
    setErroApi('')
    try {
      if (veiculoParaEditar) {
        await updateVeiculo(veiculoParaEditar.id, payload)
      } else {
        await addVeiculo(payload)
      }
      if (fecharDepois) {
        onClose()
      } else {
        setForm(empty)
        setErrors({})
      }
    } catch (e) {
      setErroApi(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow={veiculoParaEditar ? `PUT /api/Veiculo/${veiculoParaEditar.id}` : 'POST /api/Veiculo'}
      title={veiculoParaEditar ? 'Editar veículo' : 'Novo veículo'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          {!veiculoParaEditar && (
            <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={salvando}>Salvar e cadastrar outro</Button>
          )}
          <Button onClick={() => handleSubmit(true)} disabled={salvando}>
            {salvando ? 'Salvando…' : veiculoParaEditar ? 'Salvar alterações' : 'Cadastrar veículo'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-xs font-bold tracking-wide text-brand-700">1 · MODELO</p>
          <div className="space-y-3">
            <Field label="Fabricante">
              <Select value={form.fabricanteId} onChange={(e) => set('fabricanteId', e.target.value)}>
                <option value="">Selecione</option>
                {fabricantes.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </Select>
            </Field>
            <Field label="Geração">
              <Select
                value={form.geracaoId}
                onChange={(e) => set('geracaoId', e.target.value)}
                disabled={!form.fabricanteId}
              >
                <option value="">Selecione</option>
                {geracoesDoFabricante.map((g) => (
                  <option key={g.id} value={g.id}>{g.nome} · {g.periodo}</option>
                ))}
              </Select>
              {geracaoSelecionada && (
                <p className="mt-1.5 text-xs text-stone-400">
                  Motor {geracaoSelecionada.motor} · {geracaoSelecionada.cambio} · {geracaoSelecionada.norma}
                </p>
              )}
            </Field>
            <Field label="Modelo" required error={errors.modeloId}>
              <Select
                value={form.modeloId}
                onChange={(e) => set('modeloId', e.target.value)}
                disabled={!form.geracaoId}
                error={errors.modeloId}
              >
                <option value="">Selecione o modelo</option>
                {modelosDaGeracao.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome} · {m.potenciaCv} cv</option>
                ))}
              </Select>
              {modeloSelecionado && (
                <p className="mt-1.5 text-xs text-stone-400">
                  RN-03 · o modelo define os intervalos recomendados
                </p>
              )}
            </Field>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold tracking-wide text-brand-700">2 · IDENTIFICAÇÃO</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Placa" required error={errors.placa}>
              <Input value={form.placa} onChange={(e) => set('placa', e.target.value)} placeholder="ABC1D23" error={errors.placa} />
            </Field>
            <Field label="Renavam" required error={errors.renavam}>
              <Input value={form.renavam} onChange={(e) => set('renavam', e.target.value)} placeholder="00912345678" error={errors.renavam} />
            </Field>
            <Field label="Chassi (17 caracteres)" required className="col-span-2" error={errors.chassi}>
              <Input value={form.chassi} onChange={(e) => set('chassi', e.target.value.toUpperCase())} placeholder="9BVR4X20DJE882301" error={errors.chassi} maxLength={17} />
            </Field>
            <Field label="Ano fabr.">
              <Input type="number" value={form.anoFabricacao} onChange={(e) => set('anoFabricacao', e.target.value)} />
            </Field>
            <Field label="Ano modelo">
              <Input type="number" value={form.anoModelo} onChange={(e) => set('anoModelo', e.target.value)} />
            </Field>
            <Field label="Km atual" className="col-span-2" error={errors.kmAtual}>
              <Input type="number" value={form.kmAtual} onChange={(e) => set('kmAtual', e.target.value)} error={errors.kmAtual} />
            </Field>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold tracking-wide text-brand-700">3 · VÍNCULOS</p>
          <Field label="Motorista" required error={errors.motoristaId}>
            <div className="flex items-center gap-3">
              <Select className="flex-1" value={form.motoristaId} onChange={(e) => set('motoristaId', e.target.value)} error={errors.motoristaId}>
                <option value="">Selecione o motorista</option>
                {motoristasDisponiveis.map((m) => (
                  <option key={m.id} value={m.id}>{nomePessoa(m)}</option>
                ))}
              </Select>
              <Toggle checked={form.ativo} onChange={(v) => set('ativo', v)} label="Ativo" />
            </div>
          </Field>
        </div>

        {erroApi && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroApi}</p>}
      </div>
    </Drawer>
  )
}
