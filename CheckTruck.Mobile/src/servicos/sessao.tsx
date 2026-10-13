import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { chamarApi, ErroDaApi, type Opcoes } from './api'
import { lerTokens, salvarTokens, type Tokens } from './armazenamento'
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

// A sessão é a mesma conta do web: o login devolve os tokens e o /me diz quem é, o cargo e a empresa. O token vale
// 1 hora; quando vence, o app renova sozinho com a chave de renovação, sem pedir a senha. Entra de novo só quem ficou
// 14 dias sem usar o app, trocou a senha ou o e-mail, ou teve o acesso desativado.
export function SessaoProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  // Os tokens ficam fora do estado: renovar não muda as funções, e as telas não recarregam à toa
  const tokens = useRef<Tokens | null>(null)
  // Vários pedidos com o token vencido ao mesmo tempo esperam a mesma renovação
  const renovando = useRef<Promise<boolean> | null>(null)

  const guardar = useCallback(async (novos: Tokens | null) => {
    tokens.current = novos
    await salvarTokens(novos)
  }, [])

  // Troca a chave de renovação por tokens novos. false: a chave não vale mais (401). Sem internet, o erro sobe e a
  // pessoa continua logada.
  const renovar = useCallback((): Promise<boolean> => {
    renovando.current ??= (async () => {
      const refreshToken = tokens.current?.refreshToken
      if (!refreshToken) return false
      try {
        const novos = await chamarApi<Tokens>('/api/Auth/renovar', { metodo: 'POST', corpo: { refreshToken } })
        await guardar({ accessToken: novos.accessToken, refreshToken: novos.refreshToken })
        return true
      } catch (erro) {
        if (erro instanceof ErroDaApi && erro.status === 401) return false
        throw erro
      }
    })().finally(() => { renovando.current = null })
    return renovando.current
  }, [guardar])

  // Faz o pedido com o token de agora; vencido (401), renova e tenta de novo uma vez
  const comRenovacao = useCallback(async <T,>(pedido: (token: string | null) => Promise<T>): Promise<T> => {
    try {
      return await pedido(tokens.current?.accessToken ?? null)
    } catch (erro) {
      if (!(erro instanceof ErroDaApi && erro.status === 401) || !(await renovar())) throw erro
      return pedido(tokens.current?.accessToken ?? null)
    }
  }, [renovar])

  // Ao abrir o app: confere os tokens guardados com a API (renovando, se venceu). Sem renovação (401), apaga.
  useEffect(() => {
    async function restaurar() {
      tokens.current = await lerTokens()
      if (tokens.current) {
        try {
          setUsuario(await comRenovacao((token) => chamarApi<Usuario>('/api/Usuario/me', { token })))
        } catch (erro) {
          if (erro instanceof ErroDaApi && erro.status === 401) await guardar(null)
        }
      }
      setCarregando(false)
    }
    restaurar()
  }, [comRenovacao, guardar])

  const entrar = useCallback(async (email: string, senha: string) => {
    const { accessToken, refreshToken } = await chamarApi<Tokens>('/api/Auth/login', {
      metodo: 'POST',
      corpo: { email: email.trim(), senha },
    })
    const eu = await chamarApi<Usuario>('/api/Usuario/me', { token: accessToken })
    await guardar({ accessToken, refreshToken })
    setUsuario(eu)
  }, [guardar])

  // Os avisos eram de quem estava logado: os de troca agendados e o de chamado novo neste celular
  const sair = useCallback(async () => {
    await cancelarAvisos(tokens.current).catch(() => {})
    await guardar(null)
    setUsuario(null)
  }, [guardar])

  // Sem renovação no meio do uso (401): sai e o app volta para o login
  const chamar = useCallback(async <T,>(caminho: string, opcoes: Omit<Opcoes, 'token'> = {}): Promise<T> => {
    try {
      return await comRenovacao((token) => chamarApi<T>(caminho, { ...opcoes, token }))
    } catch (erro) {
      if (erro instanceof ErroDaApi && erro.status === 401) {
        await sair()
        throw new ErroDaApi('Sua sessão acabou. Entre de novo.', 401)
      }
      throw erro
    }
  }, [comRenovacao, sair])

  const recarregar = useCallback(async () => {
    setUsuario(await chamar<Usuario>('/api/Usuario/me'))
  }, [chamar])

  // As funções não mudam (nem quando o token é renovado): as telas podem usá-las para recarregar sem repetir à toa
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
