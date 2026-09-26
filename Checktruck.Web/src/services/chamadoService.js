import { naoImplementado } from './api'

// Chamados (ocorrências abertas por motoristas/mecânicos).
// A entidade Chamado ainda não existe na API — todos os endpoints abaixo são TODO.
// Modelo esperado: { id, veiculoId, abertoPorGuid, atendidoPorGuid?, tipo, descricao,
//   urgencia: baixa | media | alta, status: aberto | em_andamento | resolvido, criadoEm }
export const CHAMADOS_DISPONIVEIS = false

export const chamadoService = {
  // TODO: API — GET /api/Chamado (com OData, ex.: filtrar por status)
  async listar() {
    return []
  },

  // TODO: API — POST /api/Chamado
  // Payload esperado: { veiculoId, tipo, descricao, urgencia } (autor = usuário do token)
  criar() {
    return naoImplementado('POST /api/Chamado')
  },

  // TODO: API — PUT /api/Chamado/{id} (ou PATCH /api/Chamado/{id}/status)
  // Payload esperado: { status, atendidoPorGuid? }
  atualizar() {
    return naoImplementado('PUT /api/Chamado/{id}')
  },
}
