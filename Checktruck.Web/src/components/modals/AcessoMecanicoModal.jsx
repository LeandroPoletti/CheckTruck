import { useEffect, useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Button } from '../ui/Form'
import { mecanicoService } from '../../services'

// Cria o login do mecânico para ele consultar os caminhões pelo celular (só consulta).
export default function AcessoMecanicoModal({ open, onClose, mecanico, onSalvo }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    setEmail('')
    setSenha('')
    setConfirmar('')
    setErro('')
  }, [open])

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!email.trim()) { setErro('Informe o e-mail.'); return }
    if (senha.length < 6) { setErro('A senha precisa ter pelo menos 6 caracteres.'); return }
    if (senha !== confirmar) { setErro('As senhas não conferem.'); return }
    setSalvando(true)
    setErro('')
    try {
      const salvo = await mecanicoService.darAcesso(mecanico.id, { email, senha })
      onSalvo?.(salvo)
      onClose()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  if (!mecanico) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="POST /api/Mecanico/{id}/acesso"
      title="Dar acesso ao sistema"
      subtitle={`${mecanico.nome} — ${mecanico.funcao}`}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={salvando}>{salvando ? 'Criando…' : 'Criar acesso'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="E-mail" required hint="Vai ser o login dele.">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marco@transportadora.com.br" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Senha" required>
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </Field>
          <Field label="Confirmar" required>
            <Input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
          </Field>
        </div>
        <p className="rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-brand-800">
          A senha precisa ter letra maiúscula, minúscula, número e símbolo (ex.: Marco@123).
          Com esse login ele só consulta os caminhões; lançar OS continua com o almoxarife.
        </p>
        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </form>
    </Modal>
  )
}
