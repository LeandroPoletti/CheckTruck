import { toId, toApiId } from './api'
import { criarCrudService } from './crud'

export const intervaloFromApi = (dto) => ({
  id: toId(dto.id),
  modeloId: toId(dto.modelo?.id),
  tipoId: toId(dto.tipoManutencao?.id),
  intervaloKm: dto.intervaloKm,
  // 0 na API = sem intervalo de amaciamento (igual ao padrão)
  intervaloKmPrimeira: dto.intervaloKmPrimeira || null,
  fonte: dto.fonte ?? '',
  observacao: dto.observacao ?? '',
})

export const intervaloRecomendadoService = criarCrudService('IntervaloRecomendado', {
  fromApi: intervaloFromApi,
  toApi: (i) => ({
    modeloId: toApiId(i.modeloId),
    tipoManutencaoId: toApiId(i.tipoId),
    intervaloKm: Number(i.intervaloKm) || 0,
    intervaloKmPrimeira: Number(i.intervaloKmPrimeira) || 0,
    fonte: i.fonte,
    observacao: i.observacao,
  }),
})
