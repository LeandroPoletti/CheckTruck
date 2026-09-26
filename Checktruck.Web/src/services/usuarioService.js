import { naoImplementado } from './api'

// Usuários (Identity + perfil). Nenhum destes endpoints existe na API ainda.
export const usuarioService = {
  // TODO: API — GET /api/Usuario/me
  // Retornar o usuário logado: { id (GUID), nome, email, ativo, perfil/roles, motoristaId, tecnicoId }.
  // Hoje GET /manage/info só devolve { email, isEmailConfirmed }, então o front não sabe o perfil
  // nem o vínculo com Motorista/Tecnico. Enquanto não existir, retorna null (login entra como gerente).
  async obterMe() {
    return null
  },

  // TODO: API — GET /api/Usuario
  // Listar pessoas com { id (GUID), nome, email, ativo, perfil, cpf, motoristaId | tecnicoId }.
  // Motorista/Tecnico só expõem usuarioGuid + cpf; sem isso a tela Pessoas não mostra nome/e-mail/inativos.
  async listar() {
    return []
  },

  // TODO: API — POST /api/Usuario
  // Criar conta de acesso + papel (Administrador | Tecnico | Motorista) + registro Motorista/Tecnico
  // numa transação. O POST /register existente não retorna o GUID do usuário nem atribui papel,
  // então não dá para encadear com POST /api/Motorista ou /api/Tecnico.
  // Payload esperado: { nome, email, senha, perfil, cpf, veiculoId? }
  criarPessoa() {
    return naoImplementado('POST /api/Usuario')
  },

  // TODO: API — PUT /api/Usuario/{id}
  // Alterar nome e ativar/inativar a pessoa. Payload esperado: { nome?, ativo? }
  atualizar() {
    return naoImplementado('PUT /api/Usuario/{id}')
  },
}
