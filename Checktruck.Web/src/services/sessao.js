// Sessão do usuário logado, guardada no localStorage (sem context).
import { authService } from './index'
import { lerSessao, salvarSessao } from './api'
import { ENDPOINTS_PENDENTES, avisarPendente } from './pendentes'

// Sem GET /api/Usuario/me não dá para saber o perfil nem o vínculo Motorista/Tecnico:
// todo login entra como gerente.
export function obterUsuario() {
  const sessao = lerSessao()
  if (!sessao) return null
  avisarPendente(ENDPOINTS_PENDENTES.usuarioMe)
  return { id: null, motoristaId: null, nome: sessao.usuario, email: sessao.usuario, perfil: 'gerente', ativo: true }
}

export async function entrar(email, senha) {
  const token = await authService.login(email, senha)
  salvarSessao({ usuario: email.trim(), accessToken: token.accessToken, refreshToken: token.refreshToken })
  return obterUsuario()
}

export function sair() {
  salvarSessao(null)
}
