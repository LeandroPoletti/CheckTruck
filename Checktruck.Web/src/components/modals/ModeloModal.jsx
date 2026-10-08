import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button } from '../ui/Form'
import { modeloService, fabricanteService } from '../../services'

// Modelo = linha do fabricante (FH, FM, R, Actros...). Quem abre a tela só renderiza este modal quando ele está aberto.
// registro: modelo em edição · valoresIniciais: pré-seleção (ex.: { fabricanteId } vindo do Catálogo)
export default function ModeloModal({ registro, valoresIniciais, onClose, onSalvo }) {
  const [nome, setNome] = useState(registro?.nome ?? '')
  const [fabricanteId, setFabricanteId] = useState(registro?.fabricanteId ?? valoresIniciais?.fabricanteId ?? '')
  const [fabricantes, setFabricantes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let cancelado = false
    fabricanteService.listar()
      .then((lista) => { if (!cancelado) setFabricantes(lista.sort((a, b) => a.nome.localeCompare(b.nome))) })
      .catch((e) => { if (!cancelado) setErro(`Não foi possível carregar os fabricantes: ${e.message}`) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [])

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
      open
      onClose={onClose}
      eyebrow={registro ? 'PUT /api/Modelo/{id}' : 'POST /api/Modelo'}
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
        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </form>
    </Modal>
  )
}
