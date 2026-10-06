// Sessão do usuário logado, guardada no localStorage (sem context).
import { authService, usuarioService } from './index'
import { lerSessao, salvarSessao, toId } from './api'

// Perfil e vínculos vêm de GET /api/Usuario/me, gravados na sessão no login.
// Sessão antiga, sem perfil, obriga a entrar de novo.
export function obterUsuario() {
  const sessao = lerSessao()
  if (!sessao?.perfil) return null
  return {
    id: sessao.usuarioId,
    nome: sessao.nome || sessao.usuario,
    email: sessao.usuario,
    perfil: sessao.perfil,
    motoristaId: sessao.motoristaId ?? null,
    ativo: true,
  }
}

export async function entrar(email, senha) {
  const token = await authService.login(email, senha)
  const base = { usuario: email.trim(), accessToken: token.accessToken, refreshToken: token.refreshToken }
  salvarSessao(base) // o /me já precisa do token
  try {
    const me = await usuarioService.obterMe()
    salvarSessao({
      ...base,
      usuarioId: me.id,
      nome: me.nome,
      perfil: me.perfil,
      motoristaId: toId(me.motoristaId),
    })
  } catch (e) {
    salvarSessao(null)
    throw e
  }
  return obterUsuario()
}

export function sair() {
  salvarSessao(null)
}
