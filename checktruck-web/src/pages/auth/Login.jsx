import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Field, Input, Button } from '../../components/ui/Form'

const DEMO = [
  { perfil: 'Gerente', email: 'admin@admin.com', senha: 'admin123' },
  { perfil: 'Mecânico', email: 'wesley.martins@checktruck.com.br', senha: '123456' },
  { perfil: 'Motorista', email: 'joao.pereira@transp.com.br', senha: '123456' },
]

const HOME_BY_ROLE = {
  gerente: '/gerente/dashboard',
  mecanico: '/mecanico/dashboard',
  motorista: '/motorista/inicio',
}

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@admin.com')
  const [senha, setSenha] = useState('admin123')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const result = login(email, senha)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(HOME_BY_ROLE[result.user.perfil])
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-sm font-bold text-white">
            CT
          </div>
          <h1 className="text-2xl font-bold text-white">CheckTruck</h1>
          <p className="mt-1 text-xs font-semibold tracking-widest text-brand-300">
            CONTROLE DE MANUTENÇÃO PREVENTIVA
          </p>
        </div>

        <div className="rounded-2xl bg-white px-7 py-7 shadow-2xl">
          <h2 className="text-lg font-bold text-stone-900">Entrar</h2>
          <p className="mt-1 text-sm text-stone-500">
            Acesso para gerentes, mecânicos e motoristas.
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
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </Field>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <Button type="submit" className="w-full justify-center" size="lg">
              Entrar
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-stone-400">
            Bearer Token · <span className="font-mono-label">POST /login</span>
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-brand-800 bg-brand-800/40 px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-brand-300">
            CONTAS DE DEMONSTRAÇÃO
          </p>
          <div className="space-y-1.5">
            {DEMO.map((d) => (
              <button
                type="button"
                key={d.email}
                onClick={() => {
                  setEmail(d.email)
                  setSenha(d.senha)
                  setError('')
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs text-brand-100 hover:bg-brand-800"
              >
                <span className="font-semibold">{d.perfil}</span>
                <span className="font-mono-label text-brand-300">{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
