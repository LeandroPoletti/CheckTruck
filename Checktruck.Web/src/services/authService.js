import { api } from './api'

// Endpoints do ASP.NET Identity (MapIdentityApi) — ficam na raiz, não em /api.
export const authService = {
  // Atenção: o POST /login do Identity autentica pelo UserName (o campo se chama
  // "email", mas é passado para PasswordSignInAsync como nome de usuário).
  // O admin do seed tem UserName "Admin"; contas criadas via /register usam o e-mail.
  // → { tokenType, accessToken, expiresIn, refreshToken }
  login(usuario, senha) {
    return api.post('/login', { email: usuario.trim(), password: senha })
  },

  refresh(refreshToken) {
    return api.post('/refresh', { refreshToken })
  },

  // → { email, isEmailConfirmed }
  obterInfo() {
    return api.get('/manage/info')
  },

  alterarSenha(senhaAtual, novaSenha) {
    return api.post('/manage/info', { oldPassword: senhaAtual, newPassword: novaSenha })
  },

  // Cria apenas a conta de acesso (sem papel e sem retornar o GUID do usuário).
  registrar(email, senha) {
    return api.post('/register', { email: email.trim(), password: senha })
  },
}
