import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button } from '../ui/Form'
import { geracaoService, fabricanteService } from '../../services'

const vazio = { nome: '', fabricanteId: '', motor: '', cambio: '', norma: '', anoInicio: '', anoFim: '' }

// registro: geração em edição · valoresIniciais: pré-seleção (ex.: { fabricanteId } vindo do Catálogo)
export default function GeracaoModal({ open, onClose, registro, valoresIniciais, onSalvo }) {
  const [form, setForm] = useState(vazio)
  const [fabricantes, setFabricantes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(registro
      ? {
          nome: registro.nome ?? '',
          fabricanteId: registro.fabricanteId ?? '',
          motor: registro.motor ?? '',
          cambio: registro.cambio ?? '',
          norma: registro.norma ?? '',
          anoInicio: registro.anoInicio ?? '',
          anoFim: registro.anoFim ?? '',
        }
      : { ...vazio, ...valoresIniciais })
    setErro('')
  }, [open, registro, valoresIniciais])

  // Ao abrir: fabricantes para o select
  useEffect(() => {
    if (!open) return
    let cancelado = false
    setCarregando(true)
    fabricanteService.listar()
      .then((lista) => { if (!cancelado) setFabricantes(lista) })
      .catch((e) => { if (!cancelado) setErro(`Não foi possível carregar os fabricantes: ${e.message}`) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [open])

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    const anoInicio = Number(form.anoInicio)
    const anoFim = form.anoFim === '' ? null : Number(form.anoFim)
    if (!form.nome.trim()) { setErro('Informe o nome da geração.'); return }
    if (!form.fabricanteId) { setErro('Selecione o fabricante.'); return }
    if (!Number.isInteger(anoInicio) || anoInicio < 1900) { setErro('Informe o ano de início (ex.: 2019).'); return }
    if (anoFim !== null && (!Number.isInteger(anoFim) || anoFim < anoInicio)) {
      setErro('O ano de fim deve ser maior ou igual ao ano de início.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      const dados = {
        nome: form.nome.trim(),
        fabricanteId: form.fabricanteId,
        motor: form.motor.trim(),
        cambio: form.cambio.trim(),
        norma: form.norma.trim(),
        anoInicio,
        anoFim,
      }
      const salvo = registro ? await geracaoService.atualizar(registro.id, dados) : await geracaoService.criar(dados)
      onSalvo?.(salvo)
      onClose()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={registro ? 'PUT /api/GeracaoModelo/{id}' : 'POST /api/GeracaoModelo'}
      title={registro ? 'Editar geração' : 'Nova geração'}
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={salvando || carregando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome" required>
          <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="FH 4 (Gen 4) Euro 5" autoFocus />
        </Field>
        <Field label="Fabricante" required>
          <Select value={form.fabricanteId} onChange={(e) => set('fabricanteId', e.target.value)} disabled={carregando}>
            <option value="">{carregando ? 'Carregando…' : 'Selecione'}</option>
            {fabricantes.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ano de início" required>
            <Input type="number" value={form.anoInicio} onChange={(e) => set('anoInicio', e.target.value)} placeholder="2015" />
          </Field>
          <Field label="Ano de fim" hint="Vazio = em produção">
            <Input type="number" value={form.anoFim} onChange={(e) => set('anoFim', e.target.value)} placeholder="2018" />
          </Field>
        </div>
        <Field label="Motor">
          <Input value={form.motor} onChange={(e) => set('motor', e.target.value)} placeholder="D13K" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Câmbio">
            <Input value={form.cambio} onChange={(e) => set('cambio', e.target.value)} placeholder="I-Shift AT2612F" />
          </Field>
          <Field label="Norma de emissão">
            <Input value={form.norma} onChange={(e) => set('norma', e.target.value)} placeholder="Euro 5 / VDS-4" />
          </Field>
        </div>
        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </form>
    </Modal>
  )
}
