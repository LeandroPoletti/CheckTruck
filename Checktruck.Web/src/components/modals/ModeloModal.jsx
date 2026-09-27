import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button } from '../ui/Form'
import { modeloService, geracaoService } from '../../services'

const vazio = {
  nome: '', geracaoId: '', potenciaCv: '', eixoDianteiroPneus: '2', eixoTraseiroTandem: '2', pneusPorEixoTraseiro: '4',
}

// registro: modelo em edição · valoresIniciais: pré-seleção (ex.: { geracaoId } vindo do Catálogo)
export default function ModeloModal({ open, onClose, registro, valoresIniciais, onSalvo }) {
  const [form, setForm] = useState(vazio)
  const [geracoes, setGeracoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(registro
      ? {
          nome: registro.nome ?? '',
          geracaoId: registro.geracaoId ?? '',
          potenciaCv: String(registro.potenciaCv ?? ''),
          eixoDianteiroPneus: String(registro.eixoDianteiroPneus ?? ''),
          eixoTraseiroTandem: String(registro.eixoTraseiroTandem ?? ''),
          pneusPorEixoTraseiro: String(registro.pneusPorEixoTraseiro ?? ''),
        }
      : { ...vazio, ...valoresIniciais })
    setErro('')
  }, [open, registro, valoresIniciais])

  // Ao abrir: gerações para o select (rótulo com o fabricante)
  useEffect(() => {
    if (!open) return
    let cancelado = false
    setCarregando(true)
    geracaoService.listar()
      .then((lista) => { if (!cancelado) setGeracoes(lista) })
      .catch((e) => { if (!cancelado) setErro(`Não foi possível carregar as gerações: ${e.message}`) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [open])

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!form.nome.trim()) { setErro('Informe o nome do modelo.'); return }
    if (!form.geracaoId) { setErro('Selecione a geração.'); return }
    const numeros = ['potenciaCv', 'eixoDianteiroPneus', 'eixoTraseiroTandem', 'pneusPorEixoTraseiro']
    if (numeros.some((c) => form[c] === '' || !Number.isInteger(Number(form[c])) || Number(form[c]) < 0)) {
      setErro('Potência e dados de eixos devem ser números inteiros maiores ou iguais a zero.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      const dados = {
        nome: form.nome.trim(),
        geracaoId: form.geracaoId,
        potenciaCv: Number(form.potenciaCv),
        eixoDianteiroPneus: Number(form.eixoDianteiroPneus),
        eixoTraseiroTandem: Number(form.eixoTraseiroTandem),
        pneusPorEixoTraseiro: Number(form.pneusPorEixoTraseiro),
      }
      const salvo = registro ? await modeloService.atualizar(registro.id, dados) : await modeloService.criar(dados)
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
      eyebrow={registro ? 'PUT /api/Modelo/{id}' : 'POST /api/Modelo'}
      title={registro ? 'Editar modelo' : 'Novo modelo'}
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
          <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="FH 540" autoFocus />
        </Field>
        <Field label="Geração" required>
          <Select value={form.geracaoId} onChange={(e) => set('geracaoId', e.target.value)} disabled={carregando}>
            <option value="">{carregando ? 'Carregando…' : 'Selecione'}</option>
            {geracoes.map((g) => (
              <option key={g.id} value={g.id}>{g.nome} · {g.fabricanteNome}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Potência (cv)" required>
            <Input type="number" value={form.potenciaCv} onChange={(e) => set('potenciaCv', e.target.value)} placeholder="540" />
          </Field>
          <Field label="Pneus no eixo dianteiro" required>
            <Input type="number" value={form.eixoDianteiroPneus} onChange={(e) => set('eixoDianteiroPneus', e.target.value)} />
          </Field>
          <Field label="Eixos traseiros (tandem)" required hint="0 = sem tandem">
            <Input type="number" value={form.eixoTraseiroTandem} onChange={(e) => set('eixoTraseiroTandem', e.target.value)} />
          </Field>
          <Field label="Pneus por eixo traseiro" required>
            <Input type="number" value={form.pneusPorEixoTraseiro} onChange={(e) => set('pneusPorEixoTraseiro', e.target.value)} />
          </Field>
        </div>
        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </form>
    </Modal>
  )
}
