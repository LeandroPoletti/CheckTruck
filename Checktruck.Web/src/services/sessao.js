// Sessão de quem está logado, guardada no localStorage (sem context).
import { authService, usuarioService } from './index'
import { lerSessao, salvarSessao } from './api'

// Cargo, permissões e empresa (nome e tipo de conta) vêm de GET /api/Usuario/me, gravados na sessão no login.
// Sessão antiga, sem o tipo de conta, obriga a entrar de novo (o dono do sistema tem empresa e tipo null).
export function obterUsuario() {
  const sessao = lerSessao()
  if (!Array.isArray(sessao?.permissoes) || sessao.tipoConta === undefined) return null
  return {
    id: sessao.usuarioId,
    nome: sessao.nome,
    email: sessao.email,
    empresa: sessao.empresa,
    tipoConta: sessao.tipoConta,
    cargo: sessao.cargo,
    permissoes: sessao.permissoes,
    cuidaDosAcessos: sessao.cuidaDosAcessos,
  }
}

export async function entrar(email, senha) {
  salvarSessao(null) // sessão velha não pode atrapalhar o erro de login
  const token = await authService.login(email, senha)
  salvarSessao({ accessToken: token.accessToken }) // o /me já precisa do token
  try {
    await recarregarUsuario()
  } catch (e) {
    salvarSessao(null)
    throw e
  }
}

// Busca de novo quem está logado e grava na sessão (no login e quando a conta muda, ex.: virar Frota)
export async function recarregarUsuario() {
  const me = await usuarioService.obterMe()
  salvarSessao({
    accessToken: lerSessao().accessToken,
    usuarioId: me.id,
    nome: me.nome,
    email: me.email,
    empresa: me.empresa,
    tipoConta: me.tipoConta,
    cargo: me.cargo,
    permissoes: me.permissoes,
    cuidaDosAcessos: me.cuidaDosAcessos,
  })
}

export function sair() {
  salvarSessao(null)
}
