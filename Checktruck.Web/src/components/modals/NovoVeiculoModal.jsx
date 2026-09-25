import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Drawer } from '../ui/Overlay'
import { Field, Input, Select, Toggle, Button } from '../ui/Form'
import { getModeloCompleto } from '../../data/domain'

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
  const { fabricantes, geracoes, modelos, usuarios, addVeiculo, updateVeiculo } = useApp()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

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
        anoFabricacao: veiculoParaEditar.anoFabricacao,
        anoModelo: veiculoParaEditar.anoModelo,
        kmAtual: veiculoParaEditar.kmAtual,
        motoristaId: veiculoParaEditar.motoristaId || '',
        ativo: veiculoParaEditar.ativo,
      })
    } else {
      setForm(empty)
    }
    setErrors({})
  }, [open, veiculoParaEditar])

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

  const motoristas = usuarios.filter((u) => u.perfil === 'motorista' && u.ativo)

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
    if (form.chassi && form.chassi.length !== 17) e.chassi = `${form.chassi.length} de 17 caracteres`
    if (veiculoParaEditar && Number(form.kmAtual) < veiculoParaEditar.kmAtual) {
      e.kmAtual = 'Km atual nunca pode diminuir (RN-02).'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(fecharDepois) {
    if (!validate()) return
    const payload = {
      modeloId: form.modeloId,
      placa: form.placa.trim().toUpperCase(),
      chassi: form.chassi.trim() || null,
      renavam: form.renavam.trim() || null,
      anoFabricacao: Number(form.anoFabricacao) || null,
      anoModelo: Number(form.anoModelo) || null,
      kmAtual: Number(form.kmAtual) || 0,
      motoristaId: form.motoristaId || null,
      ativo: form.ativo,
    }
    if (veiculoParaEditar) {
      updateVeiculo(veiculoParaEditar.id, payload)
    } else {
      addVeiculo(payload)
    }
    if (fecharDepois) {
      onClose()
    } else {
      setForm(empty)
      setErrors({})
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow={veiculoParaEditar ? 'PUT /api/vehicles/:id' : 'POST /api/vehicles'}
      title={veiculoParaEditar ? 'Editar veículo' : 'Novo veículo'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          {!veiculoParaEditar && (
            <Button variant="secondary" onClick={() => handleSubmit(false)}>Salvar e cadastrar outro</Button>
          )}
          <Button onClick={() => handleSubmit(true)}>{veiculoParaEditar ? 'Salvar alterações' : 'Cadastrar veículo'}</Button>
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
                  <option key={m.id} value={m.id}>{m.nome} · {m.potenciaCv} cv · 6×4</option>
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
            <Field label="Renavam">
              <Input value={form.renavam} onChange={(e) => set('renavam', e.target.value)} placeholder="00912345678" />
            </Field>
            <Field label="Chassi (17 caracteres)" className="col-span-2" error={errors.chassi}>
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
          <Field label="Motorista (opcional)">
            <div className="flex items-center gap-3">
              <Select className="flex-1" value={form.motoristaId} onChange={(e) => set('motoristaId', e.target.value)}>
                <option value="">Sem motorista</option>
                {motoristas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </Select>
              <Toggle checked={form.ativo} onChange={(v) => set('ativo', v)} label="Ativo" />
            </div>
          </Field>
        </div>
      </div>
    </Drawer>
  )
}
