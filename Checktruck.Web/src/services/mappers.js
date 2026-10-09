// Conversão entre os DTOs da API e o formato "plano" usado pelas páginas.
// Strings dos DTOs são não anuláveis na API (Nullable habilitado): textos opcionais vão como ''.
import { toId, toApiId, anoParaApi, anoDaApi, dataParaApi, dataDaApi } from './api'
import { COMPONENTES, NORMAS } from '../data/domain'

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

// Modelo = linha do fabricante (FH, FM, R, Actros...)
export const modeloFromApi = (dto) => ({
  id: toId(dto.id),
  nome: dto.nome,
  fabricanteId: toId(dto.fabricante?.id),
  fabricanteNome: dto.fabricante?.nome ?? null,
})
export const modeloToApi = (m) => ({ nome: m.nome, fabricanteId: toApiId(m.fabricanteId) })

// Geração = época do modelo (anos, norma, motor, câmbio) com as potências em que foi vendida.
// Os anos são o ano-modelo (número); anoFim null = ainda é vendida.
export const geracaoFromApi = (dto) => ({
  id: toId(dto.id),
  nome: dto.nome,
  modeloId: toId(dto.modelo?.id),
  modeloNome: dto.modelo?.nome ?? null,
  fabricanteId: toId(dto.fabricante?.id),
  fabricanteNome: dto.fabricante?.nome ?? null,
  anoInicio: dto.anoInicio,
  anoFim: dto.anoFim,
  periodo: `${dto.anoInicio}–${dto.anoFim ?? 'atual'}`,
  norma: dto.normaEmissao, // nome do enum: 'AntesDoEuro5' | 'Euro5' | 'Euro6'
  normaNome: NORMAS[dto.normaEmissao] ?? dto.normaEmissao,
  motor: dto.motor ?? '',
  cambio: dto.caixa ?? '',
  potencias: dto.potencias.map((p) => ({ id: toId(p.id), cv: p.cv })),
})
export const geracaoToApi = (g) => ({
  nome: g.nome,
  modeloId: toApiId(g.modeloId),
  anoInicio: Number(g.anoInicio),
  anoFim: g.anoFim === '' || g.anoFim === null ? null : Number(g.anoFim),
  normaEmissao: g.norma,
  motor: g.motor || null,
  caixa: g.cambio || null,
  potencias: g.potencias.map(Number), // só os cv: a API acrescenta e tira o que mudou
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

// Na API, intervaloKmPrimeira = 0 é "igual ao intervalo" e intervaloMeses = 0 é "vence só por km" (null no front)
export const intervaloFromApi = (dto) => ({
  id: toId(dto.id),
  geracaoId: toId(dto.geracao?.id),
  tipoId: toId(dto.tipoManutencao?.id),
  intervaloKm: dto.intervaloKm,
  intervaloKmPrimeira: dto.intervaloKmPrimeira || null,
  intervaloMeses: dto.intervaloMeses || null,
  fonte: dto.fonte,
  observacao: dto.observacao,
})
export const intervaloToApi = (i) => ({
  geracaoId: toApiId(i.geracaoId),
  tipoManutencaoId: toApiId(i.tipoId),
  intervaloKm: Number(i.intervaloKm) || 0,
  intervaloKmPrimeira: Number(i.intervaloKmPrimeira) || 0,
  intervaloMeses: Number(i.intervaloMeses) || 0,
  fonte: i.fonte ?? '',
  observacao: i.observacao ?? '',
})
// Padrão seguro do sistema para um tipo, nos caminhões de uma geração
export const intervaloPadraoFromApi = (dto) => ({
  tipoId: toId(dto.tipoManutencaoId),
  intervaloKm: dto.intervaloKm,
  intervaloMeses: dto.intervaloMeses || null,
})
// Intervalo próprio de um caminhão (ex.: plano da concessionária): passa na frente da geração e do padrão
export const intervaloVeiculoFromApi = (dto) => ({
  id: toId(dto.id),
  veiculoId: toId(dto.veiculo?.id),
  tipoId: toId(dto.tipoManutencao?.id),
  intervaloKm: dto.intervaloKm,
  intervaloMeses: dto.intervaloMeses || null,
  observacao: dto.observacao ?? '',
})
export const intervaloVeiculoToApi = (i) => ({
  veiculoId: toApiId(i.veiculoId),
  tipoManutencaoId: toApiId(i.tipoId),
  intervaloKm: Number(i.intervaloKm) || 0,
  intervaloMeses: Number(i.intervaloMeses) || 0,
  observacao: i.observacao || null,
})
export const veiculoDoIntervaloFromApi = (dto) => ({
  id: toId(dto.id),
  placa: dto.placa,
  fabricanteNome: dto.fabricanteNome,
  modeloNome: dto.modeloNome,
  geracaoId: toId(dto.geracaoId),
  geracaoNome: dto.geracaoNome,
  potenciaCv: dto.potenciaCv,
})

// ---------------------------------------------------------------------------
// Frota
// ---------------------------------------------------------------------------
export const veiculoFromApi = (dto) => ({
  id: toId(dto.id),
  placa: dto.placa,
  fabricanteId: toId(dto.fabricante?.id),
  modeloId: toId(dto.modelo?.id),
  geracaoId: toId(dto.geracao?.id),
  potenciaId: toId(dto.potencia?.id),
  tracao: dto.tracao, // nome do enum (TRACOES)
  chassi: dto.chassi,
  renavam: dto.renavam,
  anoFabricacao: anoDaApi(dto.anoFabricacao),
  anoModelo: anoDaApi(dto.anoModelo),
  kmAtual: dto.kmAtual,
  ativo: dto.ativo,
  motoristaId: dto.motoristaAtual?.id ?? null,
  motoristaNome: dto.motoristaAtual?.nome ?? null,
})
// Um item da situação (km e dias que faltam; negativo = vencido). diasRestantes null = vence só por km.
const itemSituacaoFromApi = (item) => ({
  tipoId: toId(item.tipoManutencaoId),
  tipoNome: item.tipoManutencaoNome,
  intervaloKm: item.intervaloKm,
  kmProximaTroca: item.kmProximaTroca,
  kmRestante: item.kmRestante,
  diasRestantes: item.diasRestantes,
  isPrimeiraTroca: item.isPrimeiraTroca,
  status: item.status,
})
// Veículo com fabricante/modelo/geração/potência/motorista e situação de manutenção (GET /api/Veiculo/situacao).
// Os itens só vêm na situação de um caminhão (GET /api/Veiculo/{id}/situacao).
export const veiculoSituacaoFromApi = (dto) => ({
  id: toId(dto.id),
  placa: dto.placa,
  chassi: dto.chassi,
  kmAtual: dto.kmAtual,
  ativo: dto.ativo,
  anoFabricacao: anoDaApi(dto.anoFabricacao),
  anoModelo: anoDaApi(dto.anoModelo),
  fabricanteNome: dto.fabricante,
  modeloNome: dto.modelo.nome,
  geracaoId: toId(dto.geracao.id),
  geracaoNome: dto.geracao.nome,
  normaNome: NORMAS[dto.geracao.normaEmissao] ?? dto.geracao.normaEmissao,
  motor: dto.geracao.motor ?? '',
  cambio: dto.geracao.caixa ?? '',
  potenciaCv: dto.potenciaCv,
  tracao: dto.tracao,
  motoristaNome: dto.motoristaAtual?.nome ?? null,
  status: dto.status, // 'ok' | 'atencao' | 'critico'
  itemMaisUrgente: dto.itemMaisUrgente && itemSituacaoFromApi(dto.itemMaisUrgente),
  itens: (dto.itens ?? []).map(itemSituacaoFromApi),
})

export const veiculoToApi = (v) => ({
  placa: v.placa,
  potenciaId: toApiId(v.potenciaId),
  tracao: v.tracao,
  chassi: v.chassi,
  renavam: v.renavam ?? '',
  anoFabricacao: anoParaApi(v.anoFabricacao),
  anoModelo: anoParaApi(v.anoModelo),
  kmAtual: Number(v.kmAtual) || 0,
  ativo: !!v.ativo,
  motoristaAtualId: v.motoristaId || null,
})

// Uma mudança no km do caminhão. kmAnterior null = cadastro; ordemServicoId null = não foi OS (ou a OS foi excluída)
export const registroKmFromApi = (dto) => ({
  id: toId(dto.id),
  kmAnterior: dto.kmAnterior,
  kmNovo: dto.kmNovo,
  origem: dto.origem, // nome do enum (ORIGENS_KM)
  motivo: dto.motivo,
  ordemServicoId: toId(dto.ordemServicoId),
  registradoPorNome: dto.registradoPor?.nome ?? null,
  registradoEm: dto.registradoEm,
})

// Ordem de serviço (o id é o número da OS)
export const registroFromApi = (dto) => ({
  id: toId(dto.id),
  veiculoId: toId(dto.veiculo?.id),
  placa: dto.veiculo?.placa ?? null,
  tipoId: toId(dto.tipoManutencao?.id),
  tipoNome: dto.tipoManutencao?.nome ?? null,
  mecanicoId: toId(dto.mecanico?.id),
  mecanicoNome: dto.mecanico?.nome ?? null,
  mecanicoFuncao: dto.mecanico?.funcao ?? null,
  motoristaId: dto.motorista?.id ?? null,
  motoristaNome: dto.motorista?.nome ?? null,
  kmNaTroca: dto.kmAtual,
  kmProximaTroca: dto.kmProximaTroca,
  dataRealizacao: dataDaApi(dto.realizadoEm),
  dataProximaTroca: dataDaApi(dto.dataProximaTroca),
  isPrimeiraTroca: dto.isPrimeiraTroca,
  concessionaria: dto.concessionaria,
  observacoes: dto.observacao,
  lancadoPorNome: dto.lancadoPor?.nome ?? null, // quem lançou a OS (OS antigas podem estar sem)
  lancadoEm: dto.lancadoEm, // data e hora do lançamento
})
export const registroToApi = (r) => ({
  veiculoId: toApiId(r.veiculoId),
  tipoManutencaoId: toApiId(r.tipoId),
  mecanicoId: toApiId(r.mecanicoId),
  motoristaId: r.motoristaId || null, // id do acesso (texto)
  realizadoEm: dataParaApi(r.dataRealizacao),
  dataProximaTroca: dataParaApi(r.dataProximaTroca),
  kmAtual: Number(r.kmNaTroca) || 0,
  kmProximaTroca: Number(r.kmProximaTroca) || 0,
  isPrimeiraTroca: !!r.isPrimeiraTroca,
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
    fabricanteNome: a.fabricanteNome,
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
    modeloNome: g.modeloNome,
    fabricanteNome: g.fabricanteNome,
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
// Quem está logado: o acesso e o nome da empresa (aparece no menu)
export const usuarioLogadoFromApi = (dto) => ({ ...usuarioFromApi(dto), empresa: dto.empresa })
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
