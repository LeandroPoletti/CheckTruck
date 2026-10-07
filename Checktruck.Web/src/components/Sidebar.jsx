import { Fragment } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { sair } from '../services/sessao'
import { nomeCargo } from '../data/acesso'

// itens: telas que a pessoa pode usar (paginas.jsx). O título do grupo aparece antes do primeiro item dele.
export default function Sidebar({ usuario, itens }) {
  const navigate = useNavigate()

  function logout() {
    sair()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-brand-900 text-brand-50">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
          <span className="text-[15px] font-bold text-white">CheckTruck</span>
        </div>
        <p className="mt-1 text-[10px] font-semibold tracking-widest text-brand-300">
          {nomeCargo(usuario.cargo).toUpperCase()}
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {itens.map(({ path, label, icon: Icon, grupo }, i) => (
          <Fragment key={path}>
            {grupo && grupo !== itens[i - 1]?.grupo && (
              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-widest text-brand-300">{grupo}</p>
            )}
            <NavLink
              to={path}
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
          </Fragment>
        ))}
      </nav>

      <div className="border-t border-brand-800 px-5 py-4">
        <p className="text-sm font-semibold text-white leading-tight">{usuario.nome}</p>
        <p className="text-xs text-brand-300 truncate">{usuario.email}</p>
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
