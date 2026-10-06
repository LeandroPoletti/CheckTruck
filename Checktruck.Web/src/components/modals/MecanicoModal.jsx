import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Toggle, Button } from '../ui/Form'
import { mecanicoService } from '../../services'

// Cadastro simples de mecânico: nome e função (ex.: Marco Rueda / Borracheiro). Sem login.
export default function MecanicoModal({ open, onClose, registro, onSalvo }) {
  const [nome, setNome] = useState('')
  const [funcao, setFuncao] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    setNome(registro?.nome ?? '')
    setFuncao(registro?.funcao ?? '')
    setAtivo(registro?.ativo ?? true)
    setErro('')
  }, [open, registro])

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!nome.trim()) { setErro('Informe o nome do mecânico.'); return }
    if (!funcao.trim()) { setErro('Informe a função (ex.: mecânico, borracheiro).'); return }
    setSalvando(true)
    setErro('')
    try {
      const dados = { nome: nome.trim(), funcao: funcao.trim(), ativo }
      const salvo = registro
        ? await mecanicoService.atualizar(registro.id, dados)
        : await mecanicoService.criar(dados)
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
      eyebrow={registro ? 'PUT /api/Mecanico/{id}' : 'POST /api/Mecanico'}
      title={registro ? 'Editar mecânico' : 'Novo mecânico'}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome" required>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Marco Rueda" autoFocus />
        </Field>
        <Field label="Função" required>
          <Input value={funcao} onChange={(e) => setFuncao(e.target.value)} placeholder="Borracheiro" />
        </Field>
        {registro && (
          <Toggle
            checked={ativo}
            onChange={setAtivo}
            label={ativo ? 'Ativo — aparece na lista da OS' : 'Inativo — não aparece na lista da OS'}
          />
        )}
        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </form>
    </Modal>
  )
}
