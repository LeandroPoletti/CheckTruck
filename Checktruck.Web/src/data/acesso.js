// Cargos e permissões de quem entra no sistema (os ids são os nomes dos enums Cargo e Permissao da API).

export const CARGOS = [
  { id: 'Admin', nome: 'Admin' },
  { id: 'Gestor', nome: 'Gestor' },
  { id: 'Almoxarife', nome: 'Almoxarife' },
  { id: 'Mecanico', nome: 'Mecânico' },
  { id: 'ChefeManutencao', nome: 'Chefe de Manutenção' },
  { id: 'TecnicoLogistica', nome: 'Técnico de Logística' },
  { id: 'AuxiliarLogistica', nome: 'Auxiliar de Logística' },
  { id: 'Motorista', nome: 'Motorista' },
]

// Admin e Gestor podem tudo e são os únicos que cuidam dos acessos
export const CARGOS_GESTAO = ['Admin', 'Gestor']

// Dono do sistema: cuida do catálogo do sistema e não é de nenhuma empresa. Fica fora de CARGOS
// porque não se escolhe: o login dele é criado pelo sistema
const DONO_DO_SISTEMA = { id: 'DonoDoSistema', nome: 'Dono do sistema' }
export const ehDonoDoSistema = (usuario) => usuario?.cargo === DONO_DO_SISTEMA.id

// Item do catálogo: o do sistema só o dono do sistema muda; o da empresa, só a empresa
export const podeMexerNoItem = (usuario, item) => item.doSistema === ehDonoDoSistema(usuario)

// Tipo de conta da empresa (nomes do enum TipoConta da API). O Autônomo faz tudo sozinho: um acesso só,
// sem chamados e sem motorista (é ele). Pode virar Frota em Minha empresa.
export const TIPOS_CONTA = { Frota: 'Frota', Autonomo: 'Autônomo' }
export const ehAutonomo = (usuario) => usuario?.tipoConta === 'Autonomo'

export const PERMISSOES = [
  { id: 'VerFrota', nome: 'Ver frota', descricao: 'Dashboard e veículos' },
  { id: 'Veiculos', nome: 'Veículos', descricao: 'Cadastrar e editar veículos' },
  { id: 'AtualizarKm', nome: 'Atualizar km', descricao: 'Lançar o km dos caminhões' },
  { id: 'OrdemServico', nome: 'Ordem de serviço', descricao: 'Lançar e editar OS' },
  { id: 'Cadastros', nome: 'Cadastros', descricao: 'País, fabricante, modelo, geração, tipos de manutenção e mecânicos da OS' },
  { id: 'Intervalos', nome: 'Intervalos', descricao: 'Intervalos de troca' },
  { id: 'AbrirChamados', nome: 'Abrir chamados', descricao: 'Abrir e editar os próprios chamados' },
  { id: 'AtenderChamados', nome: 'Atender chamados', descricao: 'Ver todos, atender e resolver' },
]

// Veículos, km e OS ficam dentro da tela de veículos: ligar uma delas já liga "Ver frota" junto
export const PERMISSAO_BASE = 'VerFrota'
export const DEPENDEM_DA_BASE = ['Veiculos', 'AtualizarKm', 'OrdemServico']

// Telas que só Admin e Gestor veem (Acesso)
export const GESTAO = 'Gestao'

export const nomeCargo = (id) => [...CARGOS, DONO_DO_SISTEMA].find((c) => c.id === id)?.nome ?? 'Sem cargo'

// permissao: uma permissão, GESTAO ou uma lista (basta ter uma delas)
export function pode(usuario, permissao) {
  if (!usuario) return false
  if (Array.isArray(permissao)) return permissao.some((p) => pode(usuario, p))
  if (permissao === GESTAO) return usuario.cuidaDosAcessos
  return usuario.permissoes.includes(permissao)
}

export function formatCpf(cpf) {
  const d = String(cpf ?? '').replace(/\D/g, '')
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : '—'
}

// CNPJ (pode ter letras nas 12 primeiras posições) ou CPF, pelo tamanho
export function formatDocumento(documento) {
  const d = String(documento ?? '')
  if (d.length !== 14) return formatCpf(d)
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}
