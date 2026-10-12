import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { chamarApi, ErroDaApi } from './api'
import { lerToken, salvarToken } from './armazenamento'

/** Quem está logado: o mesmo GET /api/Usuario/me que o web usa. */
export type Usuario = {
  id: string
  nome: string
  email: string
  cargo: string
  permissoes: string[]
  empresa: string | null
  tipoConta: 'Frota' | 'Autonomo' | null
}

type Sessao = {
  /** Lendo a sessão guardada, logo que o app abre. */
  carregando: boolean
  usuario: Usuario | null
  entrar(email: string, senha: string): Promise<void>
  sair(): Promise<void>
}

const SessaoContext = createContext<Sessao | null>(null)

// A sessão é a mesma conta do web: o login devolve o token e o /me diz quem é, o cargo e a empresa.
export function SessaoProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true)
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  // Ao abrir o app: se tem token guardado, confere com a API. Token vencido (401) é apagado.
  useEffect(() => {
    async function restaurar() {
      const token = await lerToken()
      if (token) {
        try {
          setUsuario(await chamarApi<Usuario>('/api/Usuario/me', { token }))
        } catch (erro) {
          if (erro instanceof ErroDaApi && erro.status === 401) await salvarToken(null)
        }
      }
      setCarregando(false)
    }
    restaurar()
  }, [])

  async function entrar(email: string, senha: string) {
    const { accessToken } = await chamarApi<{ accessToken: string }>('/api/Auth/login', {
      metodo: 'POST',
      corpo: { email: email.trim(), senha },
    })
    const eu = await chamarApi<Usuario>('/api/Usuario/me', { token: accessToken })
    await salvarToken(accessToken)
    setUsuario(eu)
  }

  async function sair() {
    await salvarToken(null)
    setUsuario(null)
  }

  return <SessaoContext.Provider value={{ carregando, usuario, entrar, sair }}>{children}</SessaoContext.Provider>
}

export function useSessao(): Sessao {
  const sessao = useContext(SessaoContext)
  if (!sessao) throw new Error('useSessao precisa estar dentro do SessaoProvider')
  return sessao
}
