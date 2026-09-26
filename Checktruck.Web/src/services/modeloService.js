import { toId, toApiId } from './api'
import { criarCrudService } from './crud'

export const modeloFromApi = (dto) => ({
  id: toId(dto.id),
  geracaoId: toId(dto.geracao?.id),
  nome: dto.nome,
  potenciaCv: dto.potenciaCavalo,
  eixoDianteiroPneus: dto.eixoDianteiroPneus,
  eixoTraseiroTandem: dto.eixoTraseiroTandem,
  pneusPorEixoTraseiro: dto.pneusPorEixoTraseiro,
})

export const modeloService = criarCrudService('Modelo', {
  fromApi: modeloFromApi,
  toApi: (m) => ({
    nome: m.nome,
    geracaoId: toApiId(m.geracaoId),
    potenciaCavalo: Number(m.potenciaCv) || 0,
    eixoDianteiroPneus: Number(m.eixoDianteiroPneus) || 0,
    eixoTraseiroTandem: Number(m.eixoTraseiroTandem) || 0,
    pneusPorEixoTraseiro: Number(m.pneusPorEixoTraseiro) || 0,
  }),
})
