import { toId, toApiId, anoDaApi, anoParaApi } from './api'
import { criarCrudService } from './crud'

export const geracaoFromApi = (dto) => {
  const anoInicio = anoDaApi(dto.anoInicio)
  const anoFim = anoDaApi(dto.anoFim)
  return {
    id: toId(dto.id),
    fabricanteId: toId(dto.fabricante?.id),
    nome: dto.nome,
    motor: dto.motor ?? '',
    cambio: dto.caixa ?? '',
    norma: dto.normaEmissao ?? '',
    anoInicio,
    anoFim,
    periodo: anoInicio ? `${anoInicio}–${anoFim ?? 'atual'}` : '',
  }
}

export const geracaoModeloService = criarCrudService('GeracaoModelo', {
  fromApi: geracaoFromApi,
  toApi: (g) => ({
    nome: g.nome,
    fabricanteId: toApiId(g.fabricanteId),
    motor: g.motor,
    normaEmissao: g.norma,
    caixa: g.cambio,
    anoInicio: anoParaApi(g.anoInicio),
    anoFim: anoParaApi(g.anoFim),
  }),
})
