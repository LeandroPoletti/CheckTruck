import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button, MensagemErro } from '../ui/Form'
import { fabricanteService, paisService } from '../../services'
import { useCarga } from '../../hooks/useCarga'

// Novo fabricante (registro = null) ou editar um.
export default function FabricanteModal({ onClose, registro, onSalvo }) {
  const [nome, setNome] = useState(registro?.nome ?? '')
  const [paisOrigemId, setPaisOrigemId] = useState(registro?.paisOrigemId ?? '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Países para o select
  const { dados: paises = [], carregando, erro: erroCarga } = useCarga(() => paisService.listar())

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
      setSalvando(false)
    }
  }

  return (
    <Modal
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
        <MensagemErro>{erro || (erroCarga && `Não foi possível carregar os países: ${erroCarga.message}`)}</MensagemErro>
      </form>
    </Modal>
  )
}
