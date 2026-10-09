import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import { sair } from '../services/sessao'
import { nomeCargo } from '../data/acesso'

// Junta os itens em blocos, na ordem de paginas.jsx: item solto (sem grupo) ou grupo com os itens dele
function montarBlocos(itens) {
  const blocos = []
  for (const item of itens) {
    const ultimo = blocos.at(-1)
    if (item.grupo && ultimo?.grupo === item.grupo) ultimo.itens.push(item)
    else blocos.push(item.grupo ? { grupo: item.grupo, itens: [item] } : { item })
  }
  return blocos
}

// itens: telas que a pessoa pode usar (paginas.jsx). Cada grupo abre e fecha ao clicar, sem mexer nos outros.
export default function Sidebar({ usuario, itens }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Grupo da tela aberta (o detalhe /veiculos/5 conta como Veículos)
  const grupoAtual = itens.find((i) => pathname === i.path || pathname.startsWith(`${i.path}/`))?.grupo
  const [abertos, setAbertos] = useState(() => new Set(grupoAtual ? [grupoAtual] : []))

  // Ao chegar numa tela de um grupo fechado (ex.: atalho do dashboard), o grupo dela abre
  const [grupoVisto, setGrupoVisto] = useState(grupoAtual)
  if (grupoAtual !== grupoVisto) {
    setGrupoVisto(grupoAtual)
    if (grupoAtual) setAbertos((a) => new Set(a).add(grupoAtual))
  }

  function alternar(grupo) {
    setAbertos((a) => {
      const novos = new Set(a)
      if (novos.has(grupo)) novos.delete(grupo)
      else novos.add(grupo)
      return novos
    })
  }

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
        <p className="mt-1.5 truncate text-sm font-semibold text-brand-100" title={usuario.empresa}>{usuario.empresa}</p>
        <p className="mt-0.5 text-[10px] font-semibold tracking-widest text-brand-300">
          {nomeCargo(usuario.cargo).toUpperCase()}
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {montarBlocos(itens).map((bloco) => {
          if (!bloco.grupo) return <ItemMenu key={bloco.item.path} item={bloco.item} />

          const aberto = abertos.has(bloco.grupo)
          return (
            <div key={bloco.grupo} className="pt-2">
              <button
                type="button"
                onClick={() => alternar(bloco.grupo)}
                aria-expanded={aberto}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-semibold tracking-widest text-brand-300 transition hover:bg-brand-800 hover:text-white"
              >
                {bloco.grupo}
                <ChevronDown size={14} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
              </button>
              {aberto && (
                <div className="space-y-0.5 pl-3">
                  {bloco.itens.map((item) => <ItemMenu key={item.path} item={item} />)}
                </div>
              )}
            </div>
          )
        })}
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

function ItemMenu({ item: { path, label, icon: Icon } }) {
  return (
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
  )
}
