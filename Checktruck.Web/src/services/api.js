// Cliente HTTP da CheckTruck.Api (.NET + OData + Identity).
// As requisições vão direto para VITE_API_URL — o CORS é liberado no backend, sem proxy.
import axios from 'axios'

const SESSION_KEY = 'checktruck.session'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7013',
  headers: { Accept: 'application/json' },
})

// ---------------------------------------------------------------------------
// Sessão (token Bearer do Identity)
// ---------------------------------------------------------------------------
export function lerSessao() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function salvarSessao(sessao) {
  try {
    if (sessao) localStorage.setItem(SESSION_KEY, JSON.stringify(sessao))
    else localStorage.removeItem(SESSION_KEY)
  } catch { /* noop */ }
}

// Id do canal de mudanças deste site (services/mudancas.js): vai em cada pedido para a API não avisar quem mudou
let conexao = null
export function definirConexao(id) {
  conexao = id
}

// ---------------------------------------------------------------------------
// Interceptors
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const sessao = lerSessao()
  if (sessao?.accessToken) config.headers.Authorization = `Bearer ${sessao.accessToken}`
  if (conexao) config.headers['X-Conexao'] = conexao
  return config
})

// Todo erro da API vem como ProblemDetails: a mensagem para o usuário está no detail.
// Campo inválido (validação do .NET) vem com a lista em errors; sem nenhum dos dois, vale o título.
function extrairMensagem(data, status) {
  if (data?.detail) return data.detail
  const erros = Object.values(data?.errors ?? {}).flat()
  if (erros.length) return erros.join(' ')
  return data?.title ?? `Erro ${status} ao chamar a API.`
}

const SEM_CONEXAO = 'Não foi possível conectar à API. Verifique se a CheckTruck.Api está rodando.'

// O token vale 1 hora. Vencido, troca a chave de renovação (refreshToken) por tokens novos, sem pedir a senha.
// false: a chave não vale mais (venceu, a senha ou o e-mail mudou, ou o acesso foi desativado).
// Vários pedidos com o token vencido ao mesmo tempo esperam a mesma renovação.
let renovando = null
function renovarLogin() {
  renovando ??= (async () => {
    const refreshToken = lerSessao()?.refreshToken
    if (!refreshToken) return false
    try {
      const { data } = await axios.post(`${api.defaults.baseURL}/api/Auth/renovar`, { refreshToken })
      salvarSessao({ ...lerSessao(), accessToken: data.accessToken, refreshToken: data.refreshToken })
      return true
    } catch (e) {
      if (e.response?.status === 401) return false
      throw e
    }
  })().finally(() => { renovando = null })
  return renovando
}

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    if (!error.response) return Promise.reject(new Error(SEM_CONEXAO))
    const { status, data } = error.response
    // Token vencido: renova e repete o pedido (uma vez). Sem renovação, encerra a sessão e volta para o login
    // (sem sessão, o 401 é do próprio login e a tela trata a mensagem).
    if (status === 401 && lerSessao()) {
      if (!error.config.renovado) {
        let renovou
        try {
          renovou = await renovarLogin()
        } catch {
          return Promise.reject(new Error(SEM_CONEXAO))
        }
        if (renovou) return api({ ...error.config, renovado: true })
      }
      salvarSessao(null)
      window.location.assign('/login')
    }
    const err = new Error(extrairMensagem(data, status))
    err.status = status
    return Promise.reject(err)
  }
)

// ---------------------------------------------------------------------------
// Conversões comuns
// ---------------------------------------------------------------------------
// Ids viram string no front (os <select> trabalham com string) e voltam como número.
export const toId = (id) => (id === null || id === undefined ? null : String(id))
export const toApiId = (id) => (id === null || id === undefined || id === '' ? null : Number(id))

// As colunas são timestamptz (Npgsql exige DateTime UTC), por isso enviamos com "Z".
// O ano é lido direto da string para não sofrer com o fuso (-03 viraria o ano anterior).
export const anoParaApi = (ano) => (ano ? `${String(ano).padStart(4, '0')}-01-01T00:00:00Z` : null)
export const anoDaApi = (data) => (data ? Number(String(data).slice(0, 4)) : null)
export const dataParaApi = (data) => (data ? `${data}T00:00:00Z` : null)
export const dataDaApi = (data) => (data ? String(data).slice(0, 10) : null)
