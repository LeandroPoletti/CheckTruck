import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button, MensagemErro } from '../ui/Form'
import { modeloService, fabricanteService } from '../../services'
import { useCarga } from '../../hooks/useCarga'

// Modelo = linha do fabricante (FH, FM, R, Actros...).
// registro: modelo em edição · valoresIniciais: pré-seleção (ex.: { fabricanteId } vindo do Catálogo)
export default function ModeloModal({ registro, valoresIniciais, onClose, onSalvo }) {
  const [nome, setNome] = useState(registro?.nome ?? '')
  const [fabricanteId, setFabricanteId] = useState(registro?.fabricanteId ?? valoresIniciais?.fabricanteId ?? '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Fabricantes para o select
  const { dados: fabricantes = [], carregando, erro: erroCarga } = useCarga(async () =>
    (await fabricanteService.listar()).sort((a, b) => a.nome.localeCompare(b.nome)))

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!fabricanteId) { setErro('Selecione o fabricante.'); return }
    if (!nome.trim()) { setErro('Informe o nome do modelo.'); return }
    setSalvando(true)
    setErro('')
    try {
      const dados = { nome: nome.trim(), fabricanteId }
      const salvo = registro ? await modeloService.atualizar(registro.id, dados) : await modeloService.criar(dados)
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
      title={registro ? 'Editar modelo' : 'Novo modelo'}
      subtitle="A linha do fabricante. As épocas (anos, motor, potências) ficam nas gerações."
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={salvando || carregando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Fabricante" required>
          <Select value={fabricanteId} onChange={(e) => setFabricanteId(e.target.value)} disabled={carregando}>
            <option value="">{carregando ? 'Carregando…' : 'Selecione'}</option>
            {fabricantes.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </Select>
        </Field>
        <Field label="Nome" required hint="Ex.: FH, FM, VM, R, Actros, Stralis">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="FH" autoFocus />
        </Field>
        <MensagemErro>{erro || (erroCarga && `Não foi possível carregar os fabricantes: ${erroCarga.message}`)}</MensagemErro>
      </form>
    </Modal>
  )
}
