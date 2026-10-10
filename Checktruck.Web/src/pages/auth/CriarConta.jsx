import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Users } from 'lucide-react'
import { authService } from '../../services'
import { entrar } from '../../services/sessao'
import { Field, Input, Button } from '../../components/ui/Form'
import TelaPublica from './TelaPublica'

// A Frota tem equipe; o Autônomo é a própria pessoa (um acesso só, sem chamados e sem motoristas)
const TIPOS = [
  { id: 'Frota', titulo: 'Frota', texto: 'Tenho equipe: gestor, motoristas e mecânicos.', Icone: Users },
  { id: 'Autonomo', titulo: 'Autônomo', texto: 'Sou eu e meu caminhão: faço tudo sozinho.', Icone: User },
]

const VAZIO = { tipoConta: 'Frota', nomeEmpresa: '', cnpj: '', nome: '', cpf: '', email: '', senha: '', confirmar: '' }

// Cliente novo: cria a empresa e o primeiro acesso (Admin) e já entra no sistema
export default function CriarConta() {
  const navigate = useNavigate()
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const frota = form.tipoConta === 'Frota'

  const set = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }))

  // Aqui só o básico: os dígitos do CNPJ e do CPF, o e-mail repetido e a força da senha a API confere
  function validar() {
    if (frota && !form.nomeEmpresa.trim()) return 'Informe o nome da empresa.'
    if (frota && form.cnpj.replace(/[.\-/\s]/g, '').length !== 14) return 'O CNPJ tem 14 caracteres.'
    if (!form.nome.trim()) return 'Informe o seu nome.'
    if (form.cpf.replace(/\D/g, '').length !== 11) return 'O CPF tem 11 números.'
    if (!form.email.trim()) return 'Informe o e-mail.'
    if (!form.senha) return 'Informe a senha.'
    if (form.senha !== form.confirmar) return 'As senhas não são iguais.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const problema = validar()
    if (problema) {
      setErro(problema)
      return
    }

    setSalvando(true)
    setErro('')
    try {
      await authService.criarConta(form)
      await entrar(form.email, form.senha)
      navigate('/', { replace: true }) // a rota padrão leva para a primeira tela da pessoa
    } catch (err) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  return (
    <TelaPublica largura="max-w-md">
      <h2 className="text-lg font-bold text-stone-900">Criar conta</h2>
      <p className="mt-1 text-sm text-stone-500">
        Escolha como você trabalha. O Autônomo pode virar Frota depois, sem perder nada.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {TIPOS.map(({ id, titulo, texto, Icone }) => (
            <button
              type="button"
              key={id}
              onClick={() => set('tipoConta', id)}
              aria-pressed={form.tipoConta === id}
              className={`rounded-xl border p-3 text-left transition ${
                form.tipoConta === id ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-200' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <Icone size={18} className="text-brand-700" />
              <span className="mt-2 block text-sm font-bold text-stone-900">{titulo}</span>
              <span className="mt-0.5 block text-xs text-stone-500">{texto}</span>
            </button>
          ))}
        </div>

        {frota && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome da empresa" required>
              <Input value={form.nomeEmpresa} onChange={(e) => set('nomeEmpresa', e.target.value)} placeholder="Transportadora Exemplo" />
            </Field>
            <Field label="CNPJ" required>
              <Input value={form.cnpj} onChange={(e) => set('cnpj', e.target.value.toUpperCase())} placeholder="00.000.000/0000-00" />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Seu nome" required hint={frota ? undefined : 'É o nome da conta no menu.'}>
            <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Nome completo" />
          </Field>
          <Field label={frota ? 'Seu CPF' : 'CPF'} required>
            <Input value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" />
          </Field>
        </div>

        <Field label="E-mail" required hint="É o seu login.">
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="voce@empresa.com" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Senha" required>
            <Input type="password" value={form.senha} onChange={(e) => set('senha', e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label="Confirmar senha" required>
            <Input type="password" value={form.confirmar} onChange={(e) => set('confirmar', e.target.value)} placeholder="••••••••" />
          </Field>
        </div>
        <p className="text-xs text-stone-400">
          A senha precisa ter 6 caracteres ou mais, com letra maiúscula, minúscula, número e símbolo (ex.: @).
        </p>

        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

        <Button type="submit" className="w-full justify-center" size="lg" disabled={salvando}>
          {salvando ? 'Criando conta…' : 'Criar conta e entrar'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-900">Entrar</Link>
      </p>
    </TelaPublica>
  )
}
