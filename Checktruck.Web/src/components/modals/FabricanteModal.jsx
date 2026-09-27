import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button } from '../ui/Form'
import { fabricanteService, paisService } from '../../services'

export default function FabricanteModal({ open, onClose, registro, onSalvo }) {
  const [nome, setNome] = useState('')
  const [paisOrigemId, setPaisOrigemId] = useState('')
  const [paises, setPaises] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    setNome(registro?.nome ?? '')
    setPaisOrigemId(registro?.paisOrigemId ?? '')
    setErro('')
  }, [open, registro])

  // Ao abrir: países para o select
  useEffect(() => {
    if (!open) return
    let cancelado = false
    setCarregando(true)
    paisService.listar()
      .then((lista) => { if (!cancelado) setPaises(lista) })
      .catch((e) => { if (!cancelado) setErro(`Não foi possível carregar os países: ${e.message}`) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [open])

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome do fabricante.'); return }
    if (!paisOrigemId) { setErro('Selecione o país de origem.'); return }
    setSalvando(true)
    setErro('')
    try {
      const dados = { nome: nome.trim(), paisOrigemId }
      const salvo = registro
        ? await fabricanteService.atualizar(registro.id, dados)
        : await fabricanteService.criar(dados)
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
      eyebrow={registro ? 'PUT /api/Fabricante/{id}' : 'POST /api/Fabricante'}
      title={registro ? 'Editar fabricante' : 'Novo fabricante'}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={salvando || carregando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome" required>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Volvo" autoFocus />
        </Field>
        <Field label="País de origem" required>
          <Select value={paisOrigemId} onChange={(e) => setPaisOrigemId(e.target.value)} disabled={carregando}>
            <option value="">{carregando ? 'Carregando…' : 'Selecione'}</option>
            {paises.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </Select>
        </Field>
        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </form>
    </Modal>
  )
}
