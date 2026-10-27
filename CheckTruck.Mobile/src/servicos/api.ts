import Constants from 'expo-constants'

// Endereço da API. Em desenvolvimento, o celular usa o mesmo PC que serve o app pelo Expo, na porta 5202
// (a API rodando com o perfil "celular"). Para outro endereço (túnel, servidor), use EXPO_PUBLIC_API_URL no .env.
function enderecoDaApi(): string {
  const doEnv = process.env.EXPO_PUBLIC_API_URL
  if (doEnv) return doEnv.replace(/\/$/, '')

  const pc = Constants.expoConfig?.hostUri?.split(':')[0]
  return `http://${pc ?? 'localhost'}:5202`
}

export const API_URL = enderecoDaApi()

// Id do canal de mudanças deste app (mudancas.ts): vai em cada pedido para a API não avisar quem fez a mudança
let conexao: string | null = null
export function definirConexao(id: string | null) {
  conexao = id
}

/** Erro que a API devolveu (ou a falta de conexão, com status 0), já com a mensagem para mostrar. */
export class ErroDaApi extends Error {
  constructor(mensagem: string, readonly status: number) {
    super(mensagem)
  }
}

export type Opcoes = { metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE'; corpo?: unknown; token?: string | null }

export async function chamarApi<T>(caminho: string, { metodo = 'GET', corpo, token }: Opcoes = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (corpo !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  if (conexao) headers['X-Conexao'] = conexao

  let resposta: Response
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    })
  } catch {
    throw new ErroDaApi(
      `Não foi possível falar com o servidor (${API_URL}). Confira se a API está rodando com o perfil "celular" e se o celular está na mesma rede do PC.`,
      0)
  }

  if (!resposta.ok) throw new ErroDaApi(await mensagemDoErro(resposta), resposta.status)

  const texto = await resposta.text()
  return (texto ? JSON.parse(texto) : undefined) as T
}

// Todo erro da API vem como ProblemDetails: a mensagem para o usuário está no detail.
// Campo inválido (validação do .NET) vem com a lista em errors; sem nenhum dos dois, vale o título.
async function mensagemDoErro(resposta: Response): Promise<string> {
  try {
    const dados = await resposta.json()
    if (dados?.detail) return dados.detail
    const erros = Object.values(dados?.errors ?? {}).flat()
    if (erros.length) return erros.join(' ')
    if (dados?.title) return dados.title
  } catch {
    // resposta sem corpo
  }

  return `Erro ${resposta.status} ao chamar a API.`
}
