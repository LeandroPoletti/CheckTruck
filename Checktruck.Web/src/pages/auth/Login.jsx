import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { entrar } from '../../services/sessao'
import { Field, Input, Button, MensagemErro } from '../../components/ui/Form'
import TelaPublica from './TelaPublica'

// Logins criados pelo sistema (Program.cs da API)
const DEMO = [
  { cargo: 'Admin', email: 'admin@admin.com', senha: 'Admin@123' },
  { cargo: 'Dono do sistema', email: 'dono@checktruck.com', senha: 'Dono@123' },
]

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@admin.com')
  const [senha, setSenha] = useState('Admin@123')
  const [verSenha, setVerSenha] = useState(false)
  const [error, setError] = useState('')
  const [entrando, setEntrando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setEntrando(true)
    setError('')
    try {
      await entrar(email, senha)
      navigate('/', { replace: true }) // a rota padrão leva para a primeira tela que a pessoa pode usar
    } catch (err) {
      setError(err.message) // a API já explica: senha errada, acesso desativado ou muitas tentativas
      setEntrando(false)
    }
  }

  return (
    <TelaPublica abaixo={<ContasDeDemonstracao onEscolher={(d) => { setEmail(d.email); setSenha(d.senha); setError('') }} />}>
      <h2 className="text-[28px] font-extrabold text-stone-900">Entrar</h2>
      <p className="mt-1 text-sm text-stone-500">
        Entre com as credenciais fornecidas pela sua empresa.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Field label="E-mail" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            required
          />
        </Field>
        <Field label="Senha" required>
          {/* O olho mostra e esconde a senha, igual ao app */}
          <div className="relative">
            <Input
              type={verSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setVerSenha(!verSenha)}
              aria-label={verSenha ? 'Esconder a senha' : 'Mostrar a senha'}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            >
              {verSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </Field>

        <MensagemErro>{error}</MensagemErro>

        <Button type="submit" className="w-full justify-center" size="lg" disabled={entrando}>
          {entrando ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500">
        Não tem acesso? Peça ao gestor da sua empresa.
      </p>
    </TelaPublica>
  )
}

function ContasDeDemonstracao({ onEscolher }) {
  return (
    <div className="mt-5 rounded-2xl border border-stone-200 bg-white/60 px-4 py-3.5">
      <p className="mb-2 text-sm font-semibold text-stone-600">
        Contas de demonstração
      </p>
      <div className="space-y-1.5">
        {DEMO.map((d) => (
          <button
            type="button"
            key={d.email}
            onClick={() => onEscolher(d)}
            className="flex w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-sm text-stone-700 transition hover:border-brand-300 hover:bg-brand-50"
          >
            <span className="font-semibold">{d.cargo}</span>
            <span className="text-stone-500">{d.email}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
