import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { chamarApi, ErroDaApi, type Opcoes } from './api'
import { lerToken, salvarToken } from './armazenamento'
import { cancelarAvisos } from './avisos'

/** Quem está logado: o mesmo GET /api/Usuario/me que o web usa. */
export type Usuario = {
  id: string
  nome: string
  email: string
  cargo: string
  permissoes: string[]
  /** Admin e Gestor (e o Autônomo, que é o dono): podem tudo, inclusive corrigir o km. */
  cuidaDosAcessos: boolean
  empresa: string | null
  tipoConta: 'Frota' | 'Autonomo' | null
}

/** Chama a API com o token de quem está logado. */
export type Chamar = <T>(caminho: string, opcoes?: Omit<Opcoes, 'token'>) => Promise<T>

type Sessao = {
  /** Lendo a sessão guardada, logo que o app abre. */
  carregando: boolean
  usuario: Usuario | null
  entrar(email: string, senha: string): Promise<void>
  /** Lê de novo quem está logado (ex.: depois de o Autônomo virar Frota). */
  recarregar(): Promise<void>
  sair(): Promise<void>
  chamar: Chamar
}

const SessaoContext = createContext<Sessao | null>(null)

// A sessão é a mesma conta do web: o login devolve o token e o /me diz quem é, o cargo e a empresa.
export function SessaoProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  // Ao abrir o app: se tem token guardado, confere com a API. Token vencido (401) é apagado.
  useEffect(() => {
    async function restaurar() {
      const guardado = await lerToken()
      if (guardado) {
        try {
          const eu = await chamarApi<Usuario>('/api/Usuario/me', { token: guardado })
          setToken(guardado)
          setUsuario(eu)
        } catch (erro) {
          if (erro instanceof ErroDaApi && erro.status === 401) await salvarToken(null)
        }
      }
      setCarregando(false)
    }
    restaurar()
  }, [])

  const entrar = useCallback(async (email: string, senha: string) => {
    const { accessToken } = await chamarApi<{ accessToken: string }>('/api/Auth/login', {
      metodo: 'POST',
      corpo: { email: email.trim(), senha },
    })
    const eu = await chamarApi<Usuario>('/api/Usuario/me', { token: accessToken })
    await salvarToken(accessToken)
    setToken(accessToken)
    setUsuario(eu)
  }, [])

  // Os avisos eram de quem estava logado: os de troca agendados e o de chamado novo neste celular
  const sair = useCallback(async () => {
    await cancelarAvisos(token).catch(() => {})
    await salvarToken(null)
    setToken(null)
    setUsuario(null)
  }, [token])

  // Token vencido no meio do uso (401): sai e o app volta para o login
  const chamar = useCallback(async <T,>(caminho: string, opcoes: Omit<Opcoes, 'token'> = {}): Promise<T> => {
    try {
      return await chamarApi<T>(caminho, { ...opcoes, token })
    } catch (erro) {
      if (erro instanceof ErroDaApi && erro.status === 401) {
        await sair()
        throw new ErroDaApi('Sua sessão acabou. Entre de novo.', 401)
      }
      throw erro
    }
  }, [token, sair])

  const recarregar = useCallback(async () => {
    setUsuario(await chamar<Usuario>('/api/Usuario/me'))
  }, [chamar])

  // As funções só mudam quando o token muda: as telas podem usá-las para recarregar sem repetir à toa
  const sessao = useMemo(
    () => ({ carregando, usuario, entrar, recarregar, sair, chamar }),
    [carregando, usuario, entrar, recarregar, sair, chamar],
  )

  return <SessaoContext.Provider value={sessao}>{children}</SessaoContext.Provider>
}

export function useSessao(): Sessao {
  const sessao = useContext(SessaoContext)
  if (!sessao) throw new Error('useSessao precisa estar dentro do SessaoProvider')
  return sessao
}
