import { toId } from './api'
import { criarCrudService } from './crud'

export const paisFromApi = (dto) => ({ id: toId(dto.id), nome: dto.nome })

export const paisService = criarCrudService('Pais', {
  fromApi: paisFromApi,
  toApi: (p) => ({ nome: p.nome }),
})
