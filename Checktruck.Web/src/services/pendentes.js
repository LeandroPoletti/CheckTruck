// Endpoints que o front precisa mas que ainda não existem na CheckTruck.Api.
// Enquanto não forem implementados, o front avisa no console (uma vez por endpoint).
export const ENDPOINTS_PENDENTES = {
  usuarioMe: {
    endpoint: 'GET /api/Usuario/me',
    motivo: 'usuário logado com perfil/papel e vínculo Motorista/Tecnico (hoje todo login entra como gerente)',
  },
  usuarioListar: {
    endpoint: 'GET /api/Usuario',
    motivo: 'nome, e-mail e status ativo das pessoas (Motorista/Tecnico só expõem usuarioGuid + cpf)',
  },
  usuarioCriar: {
    endpoint: 'POST /api/Usuario',
    motivo: 'criar conta + papel + registro Motorista/Tecnico ({ nome, email, senha, perfil, cpf, veiculoId? })',
  },
  usuarioAtualizar: {
    endpoint: 'PUT /api/Usuario/{id}',
    motivo: 'alterar nome, senha e ativar/inativar pessoa',
  },
  chamadoListar: {
    endpoint: 'GET /api/Chamado',
    motivo: 'listar chamados (entidade Chamado ainda não existe)',
  },
  chamadoCriar: {
    endpoint: 'POST /api/Chamado',
    motivo: 'abrir chamado ({ veiculoId, tipo, descricao, urgencia })',
  },
  chamadoAtualizar: {
    endpoint: 'PUT /api/Chamado/{id}',
    motivo: 'alterar status/atendente do chamado',
  },
}

const avisados = new Set()

export function avisarPendente({ endpoint, motivo }) {
  if (avisados.has(endpoint)) return
  avisados.add(endpoint)
  console.warn(`[CheckTruck] Endpoint ainda não implementado na API: ${endpoint} — ${motivo}`)
}

export function avisarTodosPendentes() {
  Object.values(ENDPOINTS_PENDENTES).forEach(avisarPendente)
}

// Usado pelas ações que dependem de um endpoint pendente: avisa e rejeita com mensagem para a UI.
export function rejeitarPendente(pendente) {
  avisarPendente(pendente)
  return Promise.reject(new Error(`Endpoint ainda não implementado na API: ${pendente.endpoint}`))
}
