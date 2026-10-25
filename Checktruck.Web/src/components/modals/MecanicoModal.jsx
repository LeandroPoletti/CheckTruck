import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Toggle, Button, MensagemErro } from '../ui/Form'
import { mecanicoService } from '../../services'

// Cadastro simples de mecânico: nome e função (ex.: Marco Rueda / Borracheiro). Sem login.
export default function MecanicoModal({ onClose, registro, onSalvo }) {
  const [nome, setNome] = useState(registro?.nome ?? '')
  const [funcao, setFuncao] = useState(registro?.funcao ?? '')
  const [ativo, setAtivo] = useState(registro?.ativo ?? true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

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
      setSalvando(false)
    }
  }

  return (
    <Modal
      onClose={onClose}
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
        <MensagemErro>{erro}</MensagemErro>
      </form>
    </Modal>
  )
}
