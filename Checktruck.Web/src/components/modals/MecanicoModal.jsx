import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Toggle, Button, MensagemErro } from '../ui/Form'
import { mecanicoService } from '../../services'
import { obterUsuario } from '../../services/sessao'
import { ehAutonomo } from '../../data/acesso'

// Cadastro simples de mecânico: nome e função (ex.: Marco Rueda / Borracheiro). Sem login.
// No Autônomo é a oficina ou o mecânico onde ele faz as trocas (ex.: Oficina do Zé / Oficina).
export default function MecanicoModal({ onClose, registro, onSalvo }) {
  const autonomo = ehAutonomo(obterUsuario())
  const [nome, setNome] = useState(registro?.nome ?? '')
  const [funcao, setFuncao] = useState(registro?.funcao ?? '')
  const [ativo, setAtivo] = useState(registro?.ativo ?? true)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!nome.trim()) { setErro(autonomo ? 'Informe o nome.' : 'Informe o nome do mecânico.'); return }
    if (!funcao.trim()) { setErro(autonomo ? 'Informe a função (ex.: oficina, mecânico, borracheiro).' : 'Informe a função (ex.: mecânico, borracheiro).'); return }
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
      eyebrow={registro ? 'PUT /api/Mecanico/{id}' : 'POST /api/Mecanico'}
      title={autonomo
        ? (registro ? 'Editar oficina ou mecânico' : 'Oficina ou mecânico')
        : (registro ? 'Editar mecânico' : 'Novo mecânico')}
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
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder={autonomo ? 'Oficina do Zé' : 'Marco Rueda'} autoFocus />
        </Field>
        <Field label="Função" required>
          <Input value={funcao} onChange={(e) => setFuncao(e.target.value)} placeholder={autonomo ? 'Oficina' : 'Borracheiro'} />
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
