// Cliente HTTP da API CheckTruck (.NET + OData + Identity).
// Em dev as requisições passam pelo proxy do Vite (/backend → http://localhost:5202).

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/backend'
export const SESSION_KEY = 'checktruck.session'

export class ApiError extends Error {
  constructor(message, status = 0, body = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

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

let onNaoAutorizado = null
export function setOnNaoAutorizado(fn) {
  onNaoAutorizado = fn
}

// ---------------------------------------------------------------------------
// Requisições
// ---------------------------------------------------------------------------
function montarUrl(path, query) {
  const url = `${BASE_URL}${path}`
  if (!query) return url
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return params ? `${url}?${params}` : url
}

function extrairMensagem(body, status) {
  if (!body) return `Erro ${status} ao chamar a API.`
  if (typeof body === 'string') return body
  if (Array.isArray(body)) return body.join(', ')
  if (body.errors) {
    const erros = Object.values(body.errors).flat()
    if (erros.length) return erros.join(' ')
  }
  if (body.detail) return body.title ? `${body.title}: ${body.detail}` : body.detail
  if (body.title) return body.title
  return `Erro ${status} ao chamar a API.`
}

export async function request(method, path, { body, query } = {}) {
  const headers = { Accept: 'application/json' }
  const sessao = lerSessao()
  if (sessao?.token) headers.Authorization = `Bearer ${sessao.token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let resp
  try {
    resp = await fetch(montarUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se o CheckTruck.Api está rodando.')
  }

  const texto = await resp.text()
  let dados = null
  if (texto) {
    try { dados = JSON.parse(texto) } catch { dados = texto }
  }

  if (!resp.ok) {
    if (resp.status === 401 && onNaoAutorizado) onNaoAutorizado()
    throw new ApiError(extrairMensagem(dados, resp.status), resp.status, dados)
  }
  return dados
}

export const api = {
  get: (path, query) => request('GET', path, { query }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  delete: (path) => request('DELETE', path),
}

// Query options OData aceitas pelos controllers: $filter, $orderby, $top, $skip, $count
export function odata({ filter, orderby, top, skip, count } = {}) {
  return {
    $filter: filter,
    $orderby: orderby,
    $top: top,
    $skip: skip,
    $count: count ? 'true' : undefined,
  }
}

// Usado pelos services cujo endpoint ainda não existe na API.
export function naoImplementado(endpoint) {
  return Promise.reject(new ApiError(`Endpoint não implementado na API: ${endpoint}`, 501))
}

// ---------------------------------------------------------------------------
// Conversões comuns
// ---------------------------------------------------------------------------
export const toId = (id) => (id === null || id === undefined ? null : String(id))
export const toApiId = (id) => (id === null || id === undefined || id === '' ? null : Number(id))

// As colunas são timestamptz (Npgsql exige DateTime UTC), por isso enviamos com "Z".
// Lemos o ano direto da string para não sofrer com o fuso (-03 viraria o ano anterior).
export const anoParaApi = (ano) => (ano ? `${String(ano).padStart(4, '0')}-01-01T00:00:00Z` : null)
export const anoDaApi = (data) => (data ? Number(String(data).slice(0, 4)) : null)
export const dataParaApi = (data) => (data ? `${data}T00:00:00Z` : null)
export const dataDaApi = (data) => (data ? String(data).slice(0, 10) : null)
