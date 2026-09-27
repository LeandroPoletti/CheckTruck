// Cliente HTTP da CheckTruck.Api (.NET + OData + Identity).
// As requisições vão direto para VITE_API_URL — o CORS é liberado no backend, sem proxy.
import axios from 'axios'

export const SESSION_KEY = 'checktruck.session'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5202',
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

// ---------------------------------------------------------------------------
// Interceptors
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const sessao = lerSessao()
  if (sessao?.accessToken) config.headers.Authorization = `Bearer ${sessao.accessToken}`
  return config
})

function extrairMensagem(data, status) {
  if (!data) return `Erro ${status} ao chamar a API.`
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.join(' ')
  if (data.errors) {
    const erros = Object.values(data.errors).flat()
    if (erros.length) return erros.join(' ')
  }
  if (data.detail) return data.title ? `${data.title}: ${data.detail}` : data.detail
  if (data.title) return data.title
  return `Erro ${status} ao chamar a API.`
}

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Não foi possível conectar à API. Verifique se a CheckTruck.Api está rodando.'))
    }
    const { status, data } = error.response
    // Token expirado/inválido: encerra a sessão e volta para o login
    // (sem sessão, o 401 é do próprio login e a tela trata a mensagem).
    if (status === 401 && lerSessao()) {
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
