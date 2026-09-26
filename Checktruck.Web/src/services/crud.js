import { api } from './api'

// Service genérico para os controllers que herdam de CrudController
// (GET com OData, GET /{id}, POST, PUT /{id}, DELETE /{id}).
export function criarCrud(recurso, { fromApi, toApi }) {
  const base = `/api/${recurso}`
  return {
    async listar(params) {
      const { data } = await api.get(base, { params })
      return (data || []).map(fromApi)
    },
    async obter(id) {
      const { data } = await api.get(`${base}/${id}`)
      return fromApi(data)
    },
    async criar(dados) {
      const { data } = await api.post(base, toApi(dados))
      return fromApi(data)
    },
    async atualizar(id, dados) {
      const { data } = await api.put(`${base}/${id}`, toApi(dados))
      return fromApi(data)
    },
    async remover(id) {
      await api.delete(`${base}/${id}`)
    },
  }
}
