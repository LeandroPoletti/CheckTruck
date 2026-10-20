import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button, MensagemErro } from '../ui/Form'
import { empresaService } from '../../services'
import { REGRAS_DA_SENHA } from '../../data/acesso'

// Senha nova para o Admin de uma empresa (quando ele esquece a dele). No site e no app ele entra de novo com ela.
export default function SenhaDoAdminModal({ empresa, onClose }) {
  const [adminId, setAdminId] = useState(empresa.admins.length === 1 ? empresa.admins[0].id : '')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [trocada, setTrocada] = useState(false)
  const admin = empresa.admins.find((a) => a.id === adminId)

  function validar() {
    if (!admin) return 'Escolha o admin.'
    if (!senha) return 'Informe a senha.'
    if (senha !== confirmar) return 'As senhas não são iguais.'
    return ''
  }

  async function salvar() {
    const problema = validar()
    if (problema) {
      setErro(problema)
      return
    }
    setSalvando(true)
    setErro('')
    try {
      await empresaService.definirSenhaDoAdmin(empresa.id, admin.id, senha)
      setTrocada(true)
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  if (trocada) {
    return (
      <Modal onClose={onClose} title="Senha trocada" width="max-w-md" footer={<Button onClick={onClose}>Pronto</Button>}>
        <p className="text-sm text-stone-600">
          Passe a senha nova para <span className="font-semibold text-stone-900">{admin.nome}</span> ({admin.email}).
          No site e no app, ele vai precisar entrar de novo com ela.
        </p>
      </Modal>
    )
  }

  return (
    <Modal
      onClose={onClose}
      title="Nova senha do admin"
      subtitle={empresa.nome}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Trocar senha'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {empresa.admins.length > 1 ? (
          <Field label="Admin" required>
            <Select value={adminId} onChange={(e) => setAdminId(e.target.value)}>
              <option value="">Escolha o admin</option>
              {empresa.admins.map((a) => <option key={a.id} value={a.id}>{a.nome} ({a.email})</option>)}
            </Select>
          </Field>
        ) : (
          <div>
            <p className="text-sm font-semibold text-stone-900">{admin.nome}</p>
            <p className="text-xs text-stone-500">{admin.email}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nova senha" required>
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </Field>
          <Field label="Confirmar senha" required>
            <Input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
          </Field>
        </div>
        <p className="text-xs text-stone-400">{REGRAS_DA_SENHA}</p>
        <MensagemErro>{erro}</MensagemErro>
      </div>
    </Modal>
  )
}
