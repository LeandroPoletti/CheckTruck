// Conversão entre os DTOs da API e o formato "plano" usado pelas páginas.
// Strings dos DTOs são não anuláveis na API (Nullable habilitado): textos opcionais vão como ''.
import { toId, toApiId, anoParaApi, anoDaApi, dataParaApi, dataDaApi } from './api'
import { COMPONENTES } from '../data/domain'

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
    fabricanteNome: dto.fabricante?.nome ?? null,
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
  geracaoNome: dto.geracao?.nome ?? null,
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
  motoristaId: dto.motoristaAtual?.id ?? null,
  motoristaNome: dto.motoristaAtual?.nome ?? null,
})
// Veículo com modelo/geração/motorista e situação de manutenção (GET /api/Veiculo/situacao)
export const veiculoSituacaoFromApi = (dto) => ({
  id: toId(dto.id),
  placa: dto.placa,
  chassi: dto.chassi,
  kmAtual: dto.kmAtual,
  ativo: dto.ativo,
  anoFabricacao: anoDaApi(dto.anoFabricacao),
  anoModelo: anoDaApi(dto.anoModelo),
  modeloId: toId(dto.modelo.id),
  modeloNome: dto.modelo.nome,
  potenciaCv: dto.modelo.potenciaCavalo,
  geracaoId: toId(dto.geracao.id),
  geracaoNome: dto.geracao.nome,
  motoristaNome: dto.motoristaAtual?.nome ?? null,
  status: dto.status, // 'ok' | 'atencao' | 'critico'
  itemMaisUrgente: dto.itemMaisUrgente && {
    tipoId: toId(dto.itemMaisUrgente.tipoManutencaoId),
    tipoNome: dto.itemMaisUrgente.tipoManutencaoNome,
    kmProximaTroca: dto.itemMaisUrgente.kmProximaTroca,
    kmRestante: dto.itemMaisUrgente.kmRestante,
    isPrimeiraTroca: dto.itemMaisUrgente.isPrimeiraTroca,
    status: dto.itemMaisUrgente.status,
  },
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
  motoristaAtualId: v.motoristaId || null,
})

export const registroFromApi = (dto) => ({
  id: toId(dto.id),
  veiculoId: toId(dto.veiculo?.id),
  tipoId: toId(dto.tipoManutencao?.id),
  mecanicoId: toId(dto.mecanico?.id),
  mecanicoNome: dto.mecanico?.nome ?? null,
  mecanicoFuncao: dto.mecanico?.funcao ?? null,
  kmNaTroca: dto.kmAtual,
  kmProximaTroca: dto.kmProximaTroca,
  dataRealizacao: dataDaApi(dto.realizadoEm),
  dataProximaTroca: dataDaApi(dto.dataProximaTroca),
  isPrimeiraTroca: dto.isPrimeiraTroca,
  nrNotaFiscal: dto.numNotaFiscal,
  concessionaria: dto.concessionaria,
  observacoes: dto.observacao,
  lancadoPor: dto.lancadoPor, // login de quem lançou a OS
  lancadoEm: dto.lancadoEm, // data e hora do lançamento
})
export const registroToApi = (r) => ({
  veiculoId: toApiId(r.veiculoId),
  tipoManutencaoId: toApiId(r.tipoId),
  mecanicoId: toApiId(r.mecanicoId),
  realizadoEm: dataParaApi(r.dataRealizacao),
  dataProximaTroca: dataParaApi(r.dataProximaTroca),
  kmAtual: Number(r.kmNaTroca) || 0,
  kmProximaTroca: Number(r.kmProximaTroca) || 0,
  isPrimeiraTroca: !!r.isPrimeiraTroca,
  numNotaFiscal: r.nrNotaFiscal,
  concessionaria: r.concessionaria ?? null,
  observacao: r.observacoes ?? null,
})

// ---------------------------------------------------------------------------
// Dashboard — situação da frota já calculada pela API (GET /api/Dashboard)
// ---------------------------------------------------------------------------
export const dashboardFromApi = (dto) => ({
  frotaAtiva: dto.frotaAtiva,
  margemAlertaKm: dto.margemAlertaKm,
  contagem: dto.contagem, // { ok, atencao, critico }
  alertas: dto.alertas.map((a) => ({
    veiculoId: toId(a.veiculoId),
    placa: a.placa,
    kmAtual: a.kmAtual,
    modeloNome: a.modeloNome,
    geracaoNome: a.geracaoNome,
    tipoId: toId(a.tipoManutencaoId),
    tipoNome: a.tipoManutencaoNome,
    kmProximaTroca: a.kmProximaTroca,
    kmRestante: a.kmRestante,
    isPrimeiraTroca: a.isPrimeiraTroca,
    status: a.status, // 'ok' | 'atencao' | 'critico'
  })),
  frotaPorGeracao: dto.frotaPorGeracao.map((g) => ({
    geracaoId: toId(g.geracaoId),
    geracaoNome: g.geracaoNome,
    quantidade: g.quantidade,
  })),
})

// ---------------------------------------------------------------------------
// Acessos — o id do login é texto (GUID); cargo e permissões vêm com os nomes dos enums da API
// ---------------------------------------------------------------------------
export const usuarioFromApi = (dto) => ({
  id: dto.id,
  nome: dto.nome,
  email: dto.email,
  cpf: dto.cpf ?? '',
  cargo: dto.cargo,
  permissoes: dto.permissoes,
  cuidaDosAcessos: dto.cuidaDosAcessos,
  adminDoSistema: dto.adminDoSistema,
  ativo: dto.ativo,
})
export const usuarioToApi = (u) => ({
  nome: u.nome.trim(),
  email: u.email.trim(),
  cpf: u.cpf.trim() || null,
  cargo: u.cargo,
  permissoes: u.permissoes,
  senha: u.senha || null,
})

// Mecânicos — cadastro simples (nome e função), sem login. Usado na OS.
export const mecanicoFromApi = (dto) => ({
  id: toId(dto.id),
  nome: dto.nome,
  funcao: dto.funcao,
  ativo: dto.ativo,
})
export const mecanicoToApi = (m) => ({ nome: m.nome, funcao: m.funcao, ativo: m.ativo ?? true })

// ---------------------------------------------------------------------------
// Chamados — tipo, urgência e status vêm com os nomes dos enums da API
// ---------------------------------------------------------------------------
export const chamadoFromApi = (dto) => ({
  id: toId(dto.id),
  veiculoId: toId(dto.veiculo.id),
  placa: dto.veiculo.placa,
  tipo: dto.tipo,
  urgencia: dto.urgencia,
  descricao: dto.descricao,
  status: dto.status, // 'Pendente' | 'Concluido'
  abertoPorId: dto.abertoPor.id,
  abertoPorNome: dto.abertoPor.nome,
  abertoEm: dto.abertoEm,
  atendidoPorId: dto.atendidoPor?.id ?? null,
  atendidoPorNome: dto.atendidoPor?.nome ?? null,
  solucao: dto.solucao,
  concluidoEm: dto.concluidoEm,
})
export const chamadoToApi = (c) => ({
  veiculoId: toApiId(c.veiculoId),
  tipo: c.tipo,
  urgencia: c.urgencia,
  descricao: c.descricao.trim(),
})
