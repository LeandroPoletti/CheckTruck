import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Layout from './components/Layout'

import Login from './pages/auth/Login'

import GerenteDashboard from './pages/gerente/Dashboard'
import GerenteVeiculos from './pages/gerente/Veiculos'
import GerenteVeiculoDetalhe from './pages/gerente/VeiculoDetalhe'
import GerentePessoas from './pages/gerente/Pessoas'
import GerenteCatalogo from './pages/gerente/Catalogo'
import GerenteIntervalos from './pages/gerente/Intervalos'
import GerenteChamados from './pages/gerente/Chamados'

import MecanicoDashboard from './pages/mecanico/Dashboard'
import MecanicoVeiculos from './pages/mecanico/Veiculos'
import MecanicoVeiculoDetalhe from './pages/mecanico/VeiculoDetalhe'
import MecanicoChamados from './pages/mecanico/Chamados'

import MotoristaInicio from './pages/motorista/Inicio'
import MotoristaChamados from './pages/motorista/Chamados'
import MotoristaPerfil from './pages/motorista/Perfil'

const HOME_BY_ROLE = {
  gerente: '/gerente/dashboard',
  mecanico: '/mecanico/dashboard',
  motorista: '/motorista/inicio',
}

function ProtectedArea({ perfil, children }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (perfil && user.perfil !== perfil) return <Navigate to={HOME_BY_ROLE[user.perfil]} replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const { user } = useApp()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={HOME_BY_ROLE[user.perfil]} replace /> : <Login />}
      />

      {/* Gerente */}
      <Route path="/gerente/dashboard" element={<ProtectedArea perfil="gerente"><GerenteDashboard /></ProtectedArea>} />
      <Route path="/gerente/veiculos" element={<ProtectedArea perfil="gerente"><GerenteVeiculos /></ProtectedArea>} />
      <Route path="/gerente/veiculos/:id" element={<ProtectedArea perfil="gerente"><GerenteVeiculoDetalhe /></ProtectedArea>} />
      <Route path="/gerente/pessoas" element={<ProtectedArea perfil="gerente"><GerentePessoas /></ProtectedArea>} />
      <Route path="/gerente/catalogo" element={<ProtectedArea perfil="gerente"><GerenteCatalogo /></ProtectedArea>} />
      <Route path="/gerente/intervalos" element={<ProtectedArea perfil="gerente"><GerenteIntervalos /></ProtectedArea>} />
      <Route path="/gerente/chamados" element={<ProtectedArea perfil="gerente"><GerenteChamados /></ProtectedArea>} />

      {/* Mecânico */}
      <Route path="/mecanico/dashboard" element={<ProtectedArea perfil="mecanico"><MecanicoDashboard /></ProtectedArea>} />
      <Route path="/mecanico/veiculos" element={<ProtectedArea perfil="mecanico"><MecanicoVeiculos /></ProtectedArea>} />
      <Route path="/mecanico/veiculos/:id" element={<ProtectedArea perfil="mecanico"><MecanicoVeiculoDetalhe /></ProtectedArea>} />
      <Route path="/mecanico/chamados" element={<ProtectedArea perfil="mecanico"><MecanicoChamados /></ProtectedArea>} />

      {/* Motorista */}
      <Route path="/motorista/inicio" element={<ProtectedArea perfil="motorista"><MotoristaInicio /></ProtectedArea>} />
      <Route path="/motorista/chamados" element={<ProtectedArea perfil="motorista"><MotoristaChamados /></ProtectedArea>} />
      <Route path="/motorista/perfil" element={<ProtectedArea perfil="motorista"><MotoristaPerfil /></ProtectedArea>} />

      <Route
        path="*"
        element={<Navigate to={user ? HOME_BY_ROLE[user.perfil] : '/login'} replace />}
      />
    </Routes>
  )
}
