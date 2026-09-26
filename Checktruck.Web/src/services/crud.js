import { api } from './api'

// Service genérico para os controllers que herdam de CrudController
// (GET com OData, GET /{id}, POST, PUT /{id}, DELETE /{id}).
export function criarCrudService(recurso, { fromApi, toApi }) {
  const base = `/api/${recurso}`
  return {
    async listar(query) {
      const lista = await api.get(base, query)
      return (lista || []).map(fromApi)
    },
    async obter(id) {
      return fromApi(await api.get(`${base}/${id}`))
    },
    async criar(dados) {
      return fromApi(await api.post(base, toApi(dados)))
    },
    async atualizar(id, dados) {
      return fromApi(await api.put(`${base}/${id}`, toApi(dados)))
    },
    remover(id) {
      return api.delete(`${base}/${id}`)
    },
  }
}
