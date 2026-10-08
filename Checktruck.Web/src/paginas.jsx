// Todas as telas depois do login: rota, item do menu e a permissão que libera.
// O App monta as rotas e o menu a partir desta lista (item sem label não aparece no menu).
// Itens com o mesmo grupo, em sequência, viram um grupo que abre e fecha no menu.
import {
  LayoutDashboard, Truck, ShieldCheck, LibraryBig, Clock, MessageSquareWarning, ClipboardList,
  Globe, Factory, Layers, Boxes, Wrench, HardHat,
} from 'lucide-react'
import { GESTAO, pode } from './data/acesso'
import Dashboard from './pages/Dashboard'
import Veiculos from './pages/Veiculos'
import VeiculoDetalhe from './pages/VeiculoDetalhe'
import Catalogo from './pages/Catalogo'
import OrdensServico from './pages/OrdensServico'
import Chamados from './pages/Chamados'
import Intervalos from './pages/Intervalos'
import Paises from './pages/Paises'
import Fabricantes from './pages/Fabricantes'
import Geracoes from './pages/Geracoes'
import Modelos from './pages/Modelos'
import TiposManutencao from './pages/TiposManutencao'
import Mecanicos from './pages/Mecanicos'
import Acesso from './pages/Acesso'

export const PAGINAS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permissao: 'VerFrota', Pagina: Dashboard },

  { path: '/veiculos', label: 'Veículos', icon: Truck, grupo: 'FROTA', permissao: 'VerFrota', Pagina: Veiculos },
  { path: '/veiculos/:id', permissao: 'VerFrota', Pagina: VeiculoDetalhe },
  { path: '/catalogo', label: 'Catálogo', icon: LibraryBig, grupo: 'FROTA', permissao: 'Cadastros', Pagina: Catalogo },

  { path: '/ordens-servico', label: 'Ordens de serviço', icon: ClipboardList, grupo: 'MANUTENÇÃO', permissao: 'VerFrota', Pagina: OrdensServico },
  {
    path: '/chamados', label: 'Chamados', icon: MessageSquareWarning, grupo: 'MANUTENÇÃO',
    permissao: ['AbrirChamados', 'AtenderChamados'], Pagina: Chamados,
  },
  { path: '/intervalos', label: 'Intervalos', icon: Clock, grupo: 'MANUTENÇÃO', permissao: 'Intervalos', Pagina: Intervalos },

  { path: '/paises', label: 'Países', icon: Globe, grupo: 'CADASTROS', permissao: 'Cadastros', Pagina: Paises },
  { path: '/fabricantes', label: 'Fabricantes', icon: Factory, grupo: 'CADASTROS', permissao: 'Cadastros', Pagina: Fabricantes },
  { path: '/geracoes', label: 'Gerações', icon: Layers, grupo: 'CADASTROS', permissao: 'Cadastros', Pagina: Geracoes },
  { path: '/modelos', label: 'Modelos', icon: Boxes, grupo: 'CADASTROS', permissao: 'Cadastros', Pagina: Modelos },
  { path: '/tipos-manutencao', label: 'Tipos de manutenção', icon: Wrench, grupo: 'CADASTROS', permissao: 'Cadastros', Pagina: TiposManutencao },
  { path: '/mecanicos', label: 'Mecânicos', icon: HardHat, grupo: 'CADASTROS', permissao: 'Cadastros', Pagina: Mecanicos },

  { path: '/acesso', label: 'Acesso', icon: ShieldCheck, permissao: GESTAO, Pagina: Acesso },
]

// Itens do menu que a pessoa pode usar
export const itensDoMenu = (usuario) => PAGINAS.filter((p) => p.label && pode(usuario, p.permissao))

// Primeira tela do menu que a pessoa pode usar (toda permissão abre pelo menos uma tela)
export const paginaInicial = (usuario) => itensDoMenu(usuario)[0]?.path ?? '/dashboard'
