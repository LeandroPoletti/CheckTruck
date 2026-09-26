import { toId, toApiId } from './api'
import { criarCrudService } from './crud'

export const fabricanteFromApi = (dto) => ({
  id: toId(dto.id),
  nome: dto.nome,
  paisId: toId(dto.paisOrigem?.id),
  pais: dto.paisOrigem?.nome ?? null,
})

export const fabricanteService = criarCrudService('Fabricante', {
  fromApi: fabricanteFromApi,
  toApi: (f) => ({ nome: f.nome, paisOrigemId: toApiId(f.paisId) }),
})
