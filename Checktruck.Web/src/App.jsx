import { Routes, Route, Navigate } from 'react-router-dom'
import { obterUsuario } from './services/sessao'
import { PAGINAS, podeAbrir, itensDoMenu, paginaInicial } from './paginas'
import Layout from './components/Layout'
import Login from './pages/auth/Login'

// Componentes (e não expressões em App) para lerem a sessão a cada navegação.
// Sem a permissão da tela, volta para a primeira tela que a pessoa pode usar.
function RotaProtegida({ pagina, children }) {
  const usuario = obterUsuario()
  if (!usuario) return <Navigate to="/login" replace />
  if (!podeAbrir(usuario, pagina)) return <Navigate to={paginaInicial(usuario)} replace />
  return <Layout usuario={usuario} itensMenu={itensDoMenu(usuario)}>{children}</Layout>
}

function RotaLogin() {
  const usuario = obterUsuario()
  return usuario ? <Navigate to={paginaInicial(usuario)} replace /> : <Login />
}

function RotaPadrao() {
  const usuario = obterUsuario()
  return <Navigate to={usuario ? paginaInicial(usuario) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RotaLogin />} />
      {PAGINAS.map((pagina) => (
        <Route key={pagina.path} path={pagina.path} element={<RotaProtegida pagina={pagina}><pagina.Pagina /></RotaProtegida>} />
      ))}
      <Route path="*" element={<RotaPadrao />} />
    </Routes>
  )
}
