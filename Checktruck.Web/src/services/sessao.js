// Sessão de quem está logado, guardada no localStorage (sem context).
import { authService, usuarioService } from './index'
import { lerSessao, salvarSessao } from './api'

// Cargo, permissões e empresa vêm de GET /api/Usuario/me, gravados na sessão no login.
// Sessão antiga, sem permissões ou sem empresa, obriga a entrar de novo (o dono do sistema tem empresa null).
export function obterUsuario() {
  const sessao = lerSessao()
  if (!Array.isArray(sessao?.permissoes) || sessao.empresa === undefined) return null
  return {
    id: sessao.usuarioId,
    nome: sessao.nome,
    email: sessao.email,
    empresa: sessao.empresa,
    cargo: sessao.cargo,
    permissoes: sessao.permissoes,
    cuidaDosAcessos: sessao.cuidaDosAcessos,
  }
}

export async function entrar(email, senha) {
  salvarSessao(null) // sessão velha não pode atrapalhar o erro de login
  const token = await authService.login(email, senha)
  salvarSessao({ accessToken: token.accessToken, refreshToken: token.refreshToken }) // o /me já precisa do token
  try {
    await recarregarUsuario()
  } catch (e) {
    salvarSessao(null)
    throw e
  }
}

// Busca quem está logado e grava na sessão
async function recarregarUsuario() {
  const me = await usuarioService.obterMe()
  const { accessToken, refreshToken } = lerSessao()
  salvarSessao({
    accessToken,
    refreshToken,
    usuarioId: me.id,
    nome: me.nome,
    email: me.email,
    empresa: me.empresa,
    cargo: me.cargo,
    permissoes: me.permissoes,
    cuidaDosAcessos: me.cuidaDosAcessos,
  })
}

export function sair() {
  salvarSessao(null)
}
