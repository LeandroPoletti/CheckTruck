import { toId } from './api'
import { criarCrudService } from './crud'

// Enum CheckTruck.Dominio.Enums.Componente (serializado como número pela API)
export const COMPONENTES = {
  1: 'Motor',
  2: 'Câmbio',
  3: 'Diferencial 1',
  4: 'Diferencial 2',
  5: 'Filtro',
  6: 'Embreagem',
}

export const tipoManutencaoFromApi = (dto) => ({
  id: toId(dto.id),
  nome: dto.nome,
  descricao: dto.descricao ?? '',
  componenteId: dto.componente,
  componente: COMPONENTES[dto.componente] ?? String(dto.componente),
})

export const tipoManutencaoService = criarCrudService('TipoManutencao', {
  fromApi: tipoManutencaoFromApi,
  toApi: (t) => ({
    nome: t.nome,
    descricao: t.descricao,
    componente: Number(t.componenteId),
  }),
})
