import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Button, MensagemErro } from '../ui/Form'
import { empresaService } from '../../services'
import { REGRAS_DA_SENHA } from '../../data/acesso'

const VAZIO = { nomeEmpresa: '', cnpj: '', nome: '', cpf: '', email: '', senha: '', confirmar: '' }

const titulo = 'mb-2 text-[11px] font-semibold tracking-wide text-brand-800/70'

// Empresa nova com o Admin dela (o dono da empresa: pode tudo e cadastra a equipe em Acesso).
// Depois de cadastrar, mostra o login que o dono do sistema passa para ele.
export default function EmpresaModal({ onClose, onSalvo }) {
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [cadastrada, setCadastrada] = useState(null)

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))

  // Aqui só o básico: os dígitos do CNPJ e do CPF, o e-mail repetido e a força da senha a API confere
  function validar() {
    if (!form.nomeEmpresa.trim()) return 'Informe o nome da empresa.'
    if (form.cnpj.replace(/[.\-/\s]/g, '').length !== 14) return 'O CNPJ tem 14 caracteres.'
    if (!form.nome.trim()) return 'Informe o nome do admin.'
    if (form.cpf.replace(/\D/g, '').length !== 11) return 'O CPF tem 11 números.'
    if (!form.email.trim()) return 'Informe o e-mail.'
    if (!form.senha) return 'Informe a senha.'
    if (form.senha !== form.confirmar) return 'As senhas não são iguais.'
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
      setCadastrada(await empresaService.cadastrar(form))
      onSalvo?.()
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  if (cadastrada) {
    return (
      <Modal onClose={onClose} title="Empresa cadastrada" width="max-w-md" footer={<Button onClick={onClose}>Pronto</Button>}>
        <p className="text-sm text-stone-600">
          Passe o login para o dono da <span className="font-semibold text-stone-900">{cadastrada.nome}</span>:
        </p>
        <div className="mt-3 space-y-1 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900">
          <p>E-mail: <span className="font-semibold">{cadastrada.admins[0]?.email}</span></p>
          <p>Senha: a que você acabou de digitar</p>
        </div>
        <p className="mt-3 text-sm text-stone-500">Ele entra no site e cadastra a equipe dele em Acesso.</p>
      </Modal>
    )
  }

  return (
    <Modal
      onClose={onClose}
      title="Nova empresa"
      subtitle="A empresa cliente e o login do dono dela"
      width="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Cadastrar empresa'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className={titulo}>EMPRESA</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome da empresa" required>
              <Input value={form.nomeEmpresa} onChange={(e) => set('nomeEmpresa', e.target.value)} placeholder="Transportadora Exemplo" />
            </Field>
            <Field label="CNPJ" required>
              <Input value={form.cnpj} onChange={(e) => set('cnpj', e.target.value.toUpperCase())} placeholder="00.000.000/0000-00" />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className={titulo}>ADMIN DA EMPRESA</p>
            <p className="text-xs text-stone-500">O dono da empresa: pode tudo e cadastra a equipe dele.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome completo" required>
              <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Nome do dono da empresa" />
            </Field>
            <Field label="CPF" required>
              <Input value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" />
            </Field>
          </div>
          <Field label="E-mail" required hint="É o login dele.">
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="dono@empresa.com.br" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Senha provisória" required>
              <Input type="password" value={form.senha} onChange={(e) => set('senha', e.target.value)} />
            </Field>
            <Field label="Confirmar senha" required>
              <Input type="password" value={form.confirmar} onChange={(e) => set('confirmar', e.target.value)} />
            </Field>
          </div>
          <p className="text-xs text-stone-400">{REGRAS_DA_SENHA}</p>
        </div>

        <MensagemErro>{erro}</MensagemErro>
      </div>
    </Modal>
  )
}
