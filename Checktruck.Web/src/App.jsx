import { Routes, Route, Navigate } from 'react-router-dom'
import { obterUsuario } from './services/sessao'
import { PAGINAS, podeAbrir, itensDoMenu, paginaInicial } from './paginas'
import Layout from './components/Layout'
import Login from './pages/auth/Login'
import CriarConta from './pages/auth/CriarConta'

// Componentes (e não expressões em App) para lerem a sessão a cada navegação.
// Sem a permissão da tela, volta para a primeira tela que a pessoa pode usar.
function RotaProtegida({ pagina, children }) {
  const usuario = obterUsuario()
  if (!usuario) return <Navigate to="/login" replace />
  if (!podeAbrir(usuario, pagina)) return <Navigate to={paginaInicial(usuario)} replace />
  return <Layout usuario={usuario} itensMenu={itensDoMenu(usuario)}>{children}</Layout>
}

// Telas de quem ainda não entrou (login e criar conta): quem já entrou vai para a primeira tela dele
function RotaPublica({ children }) {
  const usuario = obterUsuario()
  return usuario ? <Navigate to={paginaInicial(usuario)} replace /> : children
}

function RotaPadrao() {
  const usuario = obterUsuario()
  return <Navigate to={usuario ? paginaInicial(usuario) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
      <Route path="/criar-conta" element={<RotaPublica><CriarConta /></RotaPublica>} />
      {PAGINAS.map((pagina) => (
        <Route key={pagina.path} path={pagina.path} element={<RotaProtegida pagina={pagina}><pagina.Pagina /></RotaProtegida>} />
      ))}
      <Route path="*" element={<RotaPadrao />} />
    </Routes>
  )
}
