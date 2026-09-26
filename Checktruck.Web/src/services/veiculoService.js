import { api, toId, toApiId, anoDaApi, anoParaApi } from './api'
import { criarCrudService } from './crud'

export const veiculoFromApi = (dto) => ({
  id: toId(dto.id),
  placa: dto.placa,
  modeloId: toId(dto.modelo?.id),
  chassi: dto.chassi ?? '',
  renavam: dto.renavam ?? '',
  anoFabricacao: anoDaApi(dto.anoFabricacao),
  anoModelo: anoDaApi(dto.anoModelo),
  kmAtual: dto.kmAtual,
  ativo: dto.ativo,
  motoristaId: toId(dto.motorista?.id),
})

export const veiculoToApi = (v) => ({
  placa: v.placa,
  modeloId: toApiId(v.modeloId),
  chassi: v.chassi,
  renavam: v.renavam,
  anoFabricacao: anoParaApi(v.anoFabricacao),
  anoModelo: anoParaApi(v.anoModelo),
  kmAtual: Number(v.kmAtual) || 0,
  ativo: !!v.ativo,
  // A API exige motorista em todo veículo (VeiculoRequestDto.MotoristaId é [Required]).
  motoristaId: toApiId(v.motoristaId),
})

export const veiculoService = {
  ...criarCrudService('Veiculo', { fromApi: veiculoFromApi, toApi: veiculoToApi }),

  // PUT /api/Veiculo/{id}/kilometragem — soma a distância percorrida ao km atual
  atualizarKm(id, distancia) {
    return api.put(`/api/Veiculo/${id}/kilometragem`, Number(distancia))
  },
}
