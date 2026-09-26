// Conversão entre os DTOs da API e o formato "plano" usado pelas páginas.
// Strings dos DTOs são não anuláveis na API (Nullable habilitado): textos opcionais vão como ''.
import { toId, toApiId, anoParaApi, anoDaApi, dataParaApi, dataDaApi } from './api'
import { COMPONENTES } from '../data/domain'
import { ENDPOINTS_PENDENTES, avisarPendente } from './pendentes'

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------
export const paisFromApi = (dto) => ({ id: toId(dto.id), nome: dto.nome })
export const paisToApi = (p) => ({ nome: p.nome })

export const fabricanteFromApi = (dto) => ({
  id: toId(dto.id),
  nome: dto.nome,
  paisOrigemId: toId(dto.paisOrigem?.id),
  pais: dto.paisOrigem?.nome ?? null,
})
export const fabricanteToApi = (f) => ({ nome: f.nome, paisOrigemId: toApiId(f.paisOrigemId) })

export const geracaoFromApi = (dto) => {
  const anoInicio = anoDaApi(dto.anoInicio)
  const anoFim = anoDaApi(dto.anoFim)
  return {
    id: toId(dto.id),
    nome: dto.nome,
    fabricanteId: toId(dto.fabricante?.id),
    motor: dto.motor,
    cambio: dto.caixa,
    norma: dto.normaEmissao,
    anoInicio,
    anoFim,
    periodo: anoInicio ? `${anoInicio}–${anoFim ?? 'atual'}` : '—',
  }
}
export const geracaoToApi = (g) => ({
  nome: g.nome,
  fabricanteId: toApiId(g.fabricanteId),
  motor: g.motor ?? '',
  normaEmissao: g.norma ?? '',
  caixa: g.cambio ?? '',
  anoInicio: anoParaApi(g.anoInicio),
  anoFim: anoParaApi(g.anoFim),
})

export const modeloFromApi = (dto) => ({
  id: toId(dto.id),
  nome: dto.nome,
  geracaoId: toId(dto.geracao?.id),
  potenciaCv: dto.potenciaCavalo,
  eixoDianteiroPneus: dto.eixoDianteiroPneus,
  eixoTraseiroTandem: dto.eixoTraseiroTandem,
  tandem: dto.eixoTraseiroTandem > 0,
  pneusPorEixoTraseiro: dto.pneusPorEixoTraseiro,
})
export const modeloToApi = (m) => ({
  nome: m.nome,
  geracaoId: toApiId(m.geracaoId),
  potenciaCavalo: Number(m.potenciaCv) || 0,
  eixoDianteiroPneus: Number(m.eixoDianteiroPneus) || 0,
  eixoTraseiroTandem: Number(m.eixoTraseiroTandem ?? (m.tandem ? 2 : 0)) || 0,
  pneusPorEixoTraseiro: Number(m.pneusPorEixoTraseiro) || 0,
})

export const tipoManutencaoFromApi = (dto) => ({
  id: toId(dto.id),
  nome: dto.nome,
  descricao: dto.descricao,
  componenteId: dto.componente,
  componente: COMPONENTES[dto.componente] ?? String(dto.componente),
})
export const tipoManutencaoToApi = (t) => ({
  nome: t.nome,
  descricao: t.descricao ?? '',
  componente: Number(t.componenteId),
})

// intervaloKmPrimeira = 0 na API significa "igual ao intervalo padrão" (null no front)
export const intervaloFromApi = (dto) => ({
  id: toId(dto.id),
  modeloId: toId(dto.modelo?.id),
  tipoId: toId(dto.tipoManutencao?.id),
  intervaloKm: dto.intervaloKm,
  intervaloKmPrimeira: dto.intervaloKmPrimeira || null,
  fonte: dto.fonte,
  observacao: dto.observacao,
})
export const intervaloToApi = (i) => ({
  modeloId: toApiId(i.modeloId),
  tipoManutencaoId: toApiId(i.tipoId),
  intervaloKm: Number(i.intervaloKm) || 0,
  intervaloKmPrimeira: Number(i.intervaloKmPrimeira) || 0,
  fonte: i.fonte ?? '',
  observacao: i.observacao ?? '',
})

// ---------------------------------------------------------------------------
// Frota
// ---------------------------------------------------------------------------
export const veiculoFromApi = (dto) => ({
  id: toId(dto.id),
  placa: dto.placa,
  modeloId: toId(dto.modelo?.id),
  chassi: dto.chassi,
  renavam: dto.renavam,
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
  renavam: v.renavam ?? '',
  anoFabricacao: anoParaApi(v.anoFabricacao),
  anoModelo: anoParaApi(v.anoModelo),
  kmAtual: Number(v.kmAtual) || 0,
  ativo: !!v.ativo,
  motoristaId: toApiId(v.motoristaId),
})

export const registroFromApi = (dto) => ({
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
  observacoes: dto.observacao,
})
export const registroToApi = (r) => ({
  veiculoId: toApiId(r.veiculoId),
  tipoManutencaoId: toApiId(r.tipoId),
  tecnicoId: toApiId(r.tecnicoId),
  realizadoEm: dataParaApi(r.dataRealizacao),
  dataProximaTroca: dataParaApi(r.dataProximaTroca),
  kmAtual: Number(r.kmNaTroca) || 0,
  kmProximaTroca: Number(r.kmProximaTroca) || 0,
  isPrimeiraTroca: !!r.isPrimeiraTroca,
  numNotaFiscal: r.nrNotaFiscal,
  concessionaria: r.concessionaria,
  observacao: r.observacoes ?? '',
})

// ---------------------------------------------------------------------------
// Pessoas — Motorista e Tecnico só têm usuarioGuid + cpf na API.
// Nome, e-mail e status virão de GET /api/Usuario (pendente); até lá o CPF identifica a pessoa.
// ---------------------------------------------------------------------------
function pessoaFromApi(perfil, dto) {
  avisarPendente(ENDPOINTS_PENDENTES.usuarioListar)
  return {
    id: toId(dto.id),
    key: `${perfil}-${dto.id}`,
    perfil,
    usuarioGuid: dto.usuarioGuid,
    cpf: dto.cpf,
    nome: dto.cpf,
    email: null,
    ativo: true,
  }
}

export const motoristaFromApi = (dto) => pessoaFromApi('motorista', dto)
export const tecnicoFromApi = (dto) => pessoaFromApi('mecanico', dto)
export const pessoaToApi = (p) => ({ usuarioGuid: p.usuarioGuid, cpf: p.cpf })
