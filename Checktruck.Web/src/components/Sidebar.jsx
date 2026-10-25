import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import { sair } from '../services/sessao'
import { nomeCargo } from '../data/acesso'
import Logo from './marca/Logo'

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
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-brand-900 text-brand-50">
      <div className="px-4 pt-6 pb-4">
        <Logo tamanho={36} className="px-1.5 text-[22px] text-white" />
        <div className="mt-5 rounded-xl bg-white/[.07] px-3 py-2.5">
          {usuario.empresa && <p className="truncate text-[15px] font-semibold text-white" title={usuario.empresa}>{usuario.empresa}</p>}
          <p className="text-sm text-brand-200">{nomeCargo(usuario.cargo)}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
        {montarBlocos(itens).map((bloco) => {
          if (!bloco.grupo) return <ItemMenu key={bloco.item.path} item={bloco.item} />

          const aberto = abertos.has(bloco.grupo)
          return (
            <div key={bloco.grupo} className="pt-3">
              <button
                type="button"
                onClick={() => alternar(bloco.grupo)}
                aria-expanded={aberto}
                className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-300 transition hover:bg-brand-800 hover:text-white"
              >
                {bloco.grupo}
                <ChevronDown size={16} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
              </button>
              {aberto && (
                <div className="mt-1 space-y-1">
                  {bloco.itens.map((item) => <ItemMenu key={item.path} item={item} />)}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight text-white">{usuario.nome}</p>
          <p className="truncate text-xs text-brand-300">{usuario.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/25 px-2.5 py-1.5 text-sm font-semibold text-brand-50 transition hover:bg-white/10"
        >
          <LogOut size={15} /> Sair
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
        `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition ${
          isActive
            ? 'bg-white/[.12] font-semibold text-white before:absolute before:-left-4 before:top-2 before:bottom-2 before:w-[5px] before:rounded-r before:bg-faixa'
            : 'text-brand-100/85 hover:bg-brand-800 hover:text-white'
        }`
      }
    >
      <Icon size={19} strokeWidth={2.1} />
      {label}
    </NavLink>
  )
}
