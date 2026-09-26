import { toId, toApiId, dataDaApi, dataParaApi, odata } from './api'
import { criarCrudService } from './crud'

export const manutencaoFromApi = (dto) => ({
  id: toId(dto.id),
  veiculoId: toId(dto.veiculo?.id),
  tipoId: toId(dto.tipoManutencao?.id),
  tecnicoId: toId(dto.tecnico?.id),
  kmNaTroca: dto.kmAtual,
  kmProximaTroca: dto.kmProximaTroca,
  dataRealizacao: dataDaApi(dto.realizadoEm),
  dataProximaTroca: dataDaApi(dto.dataProximaTroca),
  isPrimeiraTroca: dto.isPrimeiraTroca,
  nrNotaFiscal: dto.numNotaFiscal,
  concessionaria: dto.concessionaria,
  observacoes: dto.observacao ?? '',
  criadoEm: dto.criadoEm,
})

const crud = criarCrudService('Manutencao', {
  fromApi: manutencaoFromApi,
  toApi: (m) => ({
    veiculoId: toApiId(m.veiculoId),
    tipoManutencaoId: toApiId(m.tipoId),
    tecnicoId: toApiId(m.tecnicoId),
    realizadoEm: dataParaApi(m.dataRealizacao),
    dataProximaTroca: dataParaApi(m.dataProximaTroca),
    kmAtual: Number(m.kmNaTroca) || 0,
    kmProximaTroca: Number(m.kmProximaTroca) || 0,
    isPrimeiraTroca: !!m.isPrimeiraTroca,
    numNotaFiscal: m.nrNotaFiscal,
    concessionaria: m.concessionaria,
    // TODO: API — ManutencaoRequestDto.Observacao é string não-anulável (Nullable enable),
    // logo obrigatória. Trocar para string? na API e remover este valor padrão.
    observacao: m.observacoes?.trim() || 'Sem observações',
  }),
})

export const manutencaoService = {
  ...crud,

  listar({ veiculoId } = {}) {
    return crud.listar(
      odata({
        filter: veiculoId ? `Veiculo/Id eq ${Number(veiculoId)}` : undefined,
        orderby: 'RealizadoEm desc',
      })
    )
  },
}
