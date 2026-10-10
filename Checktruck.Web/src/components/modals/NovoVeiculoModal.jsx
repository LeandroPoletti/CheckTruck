import { useEffect, useMemo, useState } from 'react'
import { Drawer } from '../ui/Overlay'
import { Field, Input, Select, Toggle, Button } from '../ui/Form'
import { TRACOES, ANO_MINIMO, ANO_MAXIMO, anoValido } from '../../data/domain'
import { obterUsuario } from '../../services/sessao'
import { ehAutonomo } from '../../data/acesso'
import { veiculoService, fabricanteService, modeloService, geracaoService, usuarioService } from '../../services'

const LISTAS_VAZIAS = { fabricantes: [], modelos: [], geracoes: [], motoristas: [] }
const CATALOGO = ['fabricanteId', 'modeloId', 'geracaoId', 'potenciaId', 'tracao']

const formDoVeiculo = (v) => ({
  fabricanteId: v?.fabricanteId ?? '',
  modeloId: v?.modeloId ?? '',
  geracaoId: v?.geracaoId ?? '',
  potenciaId: v?.potenciaId ?? '',
  tracao: v?.tracao ?? '',
  placa: v?.placa ?? '',
  chassi: v?.chassi ?? '',
  renavam: v?.renavam ?? '',
  anoFabricacao: v?.anoFabricacao ?? '',
  anoModelo: v?.anoModelo ?? '',
  kmAtual: v?.kmAtual ?? '',
  motoristaId: v?.motoristaId ?? '',
  ativo: v?.ativo ?? true,
})

// Cadastrar ou editar um caminhão. Quem abre a tela só renderiza este modal quando ele está aberto.
// O caminhão aponta para uma potência: fabricante → modelo → geração → potência, em cascata.
// No Autônomo não tem motorista: é o próprio dono.
export default function NovoVeiculoModal({ veiculoParaEditar, onClose, onSalvo }) {
  const autonomo = ehAutonomo(obterUsuario())
  const [form, setForm] = useState(() => formDoVeiculo(veiculoParaEditar))
  const [errors, setErrors] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [listas, setListas] = useState(LISTAS_VAZIAS)
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState(null)
  const { fabricantes, modelos, geracoes, motoristas } = listas

  useEffect(() => {
    let cancelado = false
    Promise.all([fabricanteService.listar(), modeloService.listar(), geracaoService.listar(), usuarioService.listarMotoristas()])
      .then(([fabricantes, modelos, geracoes, motoristas]) => {
        if (cancelado) return
        fabricantes.sort((a, b) => a.nome.localeCompare(b.nome))
        modelos.sort((a, b) => a.nome.localeCompare(b.nome))
        geracoes.sort((a, b) => a.anoInicio - b.anoInicio || a.nome.localeCompare(b.nome))
        setListas({ fabricantes, modelos, geracoes, motoristas })
      })
      .catch((e) => { if (!cancelado) setErroCarga(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [])

  const modelosDoFabricante = useMemo(() => modelos.filter((m) => m.fabricanteId === form.fabricanteId), [modelos, form.fabricanteId])
  const geracoesDoModelo = useMemo(() => geracoes.filter((g) => g.modeloId === form.modeloId), [geracoes, form.modeloId])
  const geracao = geracoes.find((g) => g.id === form.geracaoId)

  function set(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      // Trocar um nível da cascata limpa os de baixo
      if (field === 'fabricanteId') Object.assign(next, { modeloId: '', geracaoId: '', potenciaId: '' })
      if (field === 'modeloId') Object.assign(next, { geracaoId: '', potenciaId: '' })
      if (field === 'geracaoId') next.potenciaId = ''
      return next
    })
  }

  function validate() {
    const e = {}
    if (!form.potenciaId) e.potenciaId = 'Escolha a potência.'
    if (!form.tracao) e.tracao = 'Escolha a tração.'
    if (!form.placa.trim()) e.placa = 'Placa é obrigatória.'
    if (form.chassi.length !== 17) e.chassi = `${form.chassi.length} de 17 caracteres`
    // Ano modelo = ano de fabricação ou o seguinte (ex.: fabricado em 2019, modelo 2019 ou 2020)
    const anoFabricacao = Number(form.anoFabricacao)
    const anoModelo = Number(form.anoModelo)
    if (!anoValido(anoFabricacao)) e.anoFabricacao = `De ${ANO_MINIMO} a ${ANO_MAXIMO}`
    if (!anoValido(anoModelo)) e.anoModelo = `De ${ANO_MINIMO} a ${ANO_MAXIMO}`
    else if (!e.anoFabricacao && anoModelo !== anoFabricacao && anoModelo !== anoFabricacao + 1) {
      e.anoModelo = `${anoFabricacao} ou ${anoFabricacao + 1}`
    }
    const km = Number(form.kmAtual || 0)
    if (!Number.isInteger(km) || km < 0) e.kmAtual = 'O km não pode ser negativo.'
    else if (veiculoParaEditar && km < veiculoParaEditar.kmAtual) e.kmAtual = 'O km não pode diminuir (RN-02). Para km digitado errado, Admin ou Gestor usam Corrigir km.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(fecharDepois) {
    if (!validate()) return
    const payload = {
      potenciaId: form.potenciaId,
      tracao: form.tracao,
      placa: form.placa.trim().toUpperCase(),
      chassi: form.chassi.trim(),
      renavam: form.renavam.trim() || null,
      anoFabricacao: Number(form.anoFabricacao),
      anoModelo: Number(form.anoModelo),
      kmAtual: Number(form.kmAtual || 0),
      motoristaId: form.motoristaId || null,
      ativo: form.ativo,
    }
    setSalvando(true)
    try {
      const salvo = veiculoParaEditar
        ? await veiculoService.atualizar(veiculoParaEditar.id, payload)
        : await veiculoService.criar(payload)
      onSalvo?.(salvo)
    } catch (err) {
      setErrors({ api: err.message })
      return
    } finally {
      setSalvando(false)
    }
    if (fecharDepois) {
      onClose()
    } else {
      // Próximo caminhão da frota: mantém fabricante, modelo, geração, potência e tração
      setForm((f) => ({ ...formDoVeiculo(null), ...Object.fromEntries(CATALOGO.map((c) => [c, f[c]])) }))
      setErrors({})
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow={veiculoParaEditar ? 'PUT /api/Veiculo/{id}' : 'POST /api/Veiculo'}
      title={veiculoParaEditar ? 'Editar veículo' : 'Novo veículo'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          {!veiculoParaEditar && (
            <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={salvando || carregando || !!erroCarga}>Salvar e cadastrar outro</Button>
          )}
          <Button onClick={() => handleSubmit(true)} disabled={salvando || carregando || !!erroCarga}>{veiculoParaEditar ? 'Salvar alterações' : 'Cadastrar veículo'}</Button>
        </>
      }
    >
      <div className="space-y-6">
        {carregando && <p className="text-sm text-stone-400">Carregando catálogo e motoristas…</p>}
        {erroCarga && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroCarga}</p>}
        <div>
          <p className="mb-3 text-xs font-bold tracking-wide text-brand-700">1 · MODELO</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fabricante">
              <Select value={form.fabricanteId} onChange={(e) => set('fabricanteId', e.target.value)}>
                <option value="">Selecione</option>
                {fabricantes.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </Select>
            </Field>
            <Field label="Modelo">
              <Select value={form.modeloId} onChange={(e) => set('modeloId', e.target.value)} disabled={!form.fabricanteId}>
                <option value="">Selecione</option>
                {modelosDoFabricante.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </Select>
            </Field>
            <Field label="Geração" className="col-span-2">
              <Select value={form.geracaoId} onChange={(e) => set('geracaoId', e.target.value)} disabled={!form.modeloId}>
                <option value="">Selecione</option>
                {geracoesDoModelo.map((g) => <option key={g.id} value={g.id}>{g.nome} · {g.periodo}</option>)}
              </Select>
              {geracao && (
                <p className="mt-1.5 text-xs text-stone-400">
                  {[geracao.normaNome, geracao.motor && `Motor ${geracao.motor}`, geracao.cambio].filter(Boolean).join(' · ')}
                </p>
              )}
            </Field>
            <Field label="Potência" required error={errors.potenciaId}>
              <Select value={form.potenciaId} onChange={(e) => set('potenciaId', e.target.value)} disabled={!geracao} error={errors.potenciaId}>
                <option value="">Selecione</option>
                {geracao?.potencias.map((p) => <option key={p.id} value={p.id}>{p.cv} cv</option>)}
              </Select>
            </Field>
            <Field label="Tração" required error={errors.tracao}>
              <Select value={form.tracao} onChange={(e) => set('tracao', e.target.value)} error={errors.tracao}>
                <option value="">Selecione</option>
                {Object.entries(TRACOES).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
              </Select>
            </Field>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Não achou? Cadastre em Cadastros → Modelos e Gerações. A geração define os intervalos recomendados.
          </p>
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
            <Field label="Chassi (17 caracteres)" required className="col-span-2" error={errors.chassi}>
              <Input value={form.chassi} onChange={(e) => set('chassi', e.target.value.toUpperCase())} placeholder="9BVR4X20DJE882301" error={errors.chassi} maxLength={17} />
            </Field>
            <Field label="Ano fabr." required error={errors.anoFabricacao}>
              <Input type="number" min={ANO_MINIMO} max={ANO_MAXIMO} value={form.anoFabricacao} onChange={(e) => set('anoFabricacao', e.target.value)} placeholder="2019" error={errors.anoFabricacao} />
            </Field>
            <Field label="Ano modelo" required hint="O de fabricação ou o seguinte" error={errors.anoModelo}>
              <Input type="number" min={ANO_MINIMO} max={ANO_MAXIMO} value={form.anoModelo} onChange={(e) => set('anoModelo', e.target.value)} placeholder="2020" error={errors.anoModelo} />
            </Field>
            <Field label="Km atual" className="col-span-2" error={errors.kmAtual}>
              <Input type="number" min="0" value={form.kmAtual} onChange={(e) => set('kmAtual', e.target.value)} error={errors.kmAtual} />
            </Field>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold tracking-wide text-brand-700">3 · {autonomo ? 'SITUAÇÃO' : 'VÍNCULOS'}</p>
          {autonomo ? (
            <Toggle checked={form.ativo} onChange={(v) => set('ativo', v)} label="Ativo" />
          ) : (
            <Field label="Motorista atual (opcional)" hint="Muda sozinho quando um motorista abre chamado deste caminhão.">
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
          )}
        </div>

        {errors.api && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.api}</p>}
      </div>
    </Drawer>
  )
}
