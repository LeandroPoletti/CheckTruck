import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Users, LibraryBig, Clock, LogOut,
  Wrench, ClipboardList, UserCircle, MessageSquareWarning,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const NAV = {
  gerente: [
    { to: '/gerente/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/gerente/veiculos', label: 'Veículos', icon: Truck },
    { to: '/gerente/pessoas', label: 'Pessoas', icon: Users },
    { to: '/gerente/catalogo', label: 'Catálogo', icon: LibraryBig },
    { to: '/gerente/intervalos', label: 'Intervalos', icon: Clock },
    { to: '/gerente/chamados', label: 'Chamados', icon: MessageSquareWarning },
  ],
  mecanico: [
    { to: '/mecanico/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/mecanico/veiculos', label: 'Veículos', icon: Truck },
    { to: '/mecanico/chamados', label: 'Chamados', icon: ClipboardList },
  ],
  motorista: [
    { to: '/motorista/inicio', label: 'Meu veículo', icon: Truck },
    { to: '/motorista/chamados', label: 'Meus chamados', icon: Wrench },
    { to: '/motorista/perfil', label: 'Meu perfil', icon: UserCircle },
  ],
}

const ROLE_LABEL = { gerente: 'GERENTE', mecanico: 'MECÂNICO', motorista: 'MOTORISTA' }

export default function Sidebar() {
  const { user, logout } = useApp()
  const items = NAV[user.perfil] || []

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-brand-900 text-brand-50">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
          <span className="text-[15px] font-bold text-white">CheckTruck</span>
        </div>
        <p className="mt-1 text-[10px] font-semibold tracking-widest text-brand-300">
          {ROLE_LABEL[user.perfil]}
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-brand-700 text-white font-semibold'
                  : 'text-brand-100/80 hover:bg-brand-800 hover:text-white'
              }`
            }
          >
            <Icon size={16} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-brand-800 px-5 py-4">
        <p className="text-sm font-semibold text-white leading-tight">{user.nome}</p>
        <p className="text-xs text-brand-300 truncate">{user.email}</p>
        <button
          onClick={logout}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-300 hover:text-white transition"
        >
          <LogOut size={13} /> Sair
        </button>
      </div>
    </aside>
  )
}
