import type { Chamar } from './sessao'

// Cadastros que a OS, o caminhão e os intervalos usam: tipos de manutenção, mecânicos (no Autônomo, "oficinas e
// mecânicos"), motoristas e o catálogo (fabricante → modelo → geração, com as potências).
// Ver: estar logado. Cadastrar, editar e excluir: permissão Cadastros.

export type TipoDeManutencao = {
  id: number
  nome: string
  /** O número do enum Componente da API (nomes em dados/intervalos). */
  componente: number
  descricao: string
  /** Do catálogo do sistema: a empresa usa, mas não muda nem exclui. */
  doSistema: boolean
}
export type NovoTipo = { nome: string; componente: number; descricao: string }
export type Mecanico = { id: number; nome: string; funcao: string; ativo: boolean }
export type Motorista = { id: string; nome: string }

export const tiposDeManutencao = (chamar: Chamar) => chamar<TipoDeManutencao[]>('/api/TipoManutencao')
export const tipoDeManutencao = (chamar: Chamar, id: number) => chamar<TipoDeManutencao>(`/api/TipoManutencao/${id}`)

/** Cria (sem id) ou muda um tipo de manutenção da empresa. */
export const salvarTipo = (chamar: Chamar, tipo: NovoTipo, id?: number) =>
  chamar<TipoDeManutencao>(id ? `/api/TipoManutencao/${id}` : '/api/TipoManutencao', {
    metodo: id ? 'PUT' : 'POST',
    corpo: { nome: tipo.nome.trim(), descricao: tipo.descricao.trim(), componente: tipo.componente },
  })

/** A API recusa quando o tipo já tem OS lançada ou intervalo cadastrado. */
export const excluirTipo = (chamar: Chamar, id: number) => chamar<void>(`/api/TipoManutencao/${id}`, { metodo: 'DELETE' })

/** Todos, ativos e inativos (tela Oficinas e mecânicos). */
export const listarMecanicos = (chamar: Chamar) => chamar<Mecanico[]>('/api/Mecanico')
export const mecanico = (chamar: Chamar, id: number) => chamar<Mecanico>(`/api/Mecanico/${id}`)

export const mecanicosAtivos = (chamar: Chamar) =>
  chamar<Mecanico[]>(`/api/Mecanico?$filter=${encodeURIComponent('Ativo eq true')}`)

/** Cria (sem id) ou muda um mecânico (no Autônomo, a oficina ou o mecânico). */
export const salvarMecanico = (chamar: Chamar, { nome, funcao, ativo }: Omit<Mecanico, 'id'>, id?: number) =>
  chamar<Mecanico>(id ? `/api/Mecanico/${id}` : '/api/Mecanico', {
    metodo: id ? 'PUT' : 'POST',
    corpo: { nome: nome.trim(), funcao: funcao.trim(), ativo },
  })

/** A API recusa quando já tem OS lançada com ele: aí é desativar. */
export const excluirMecanico = (chamar: Chamar, id: number) => chamar<void>(`/api/Mecanico/${id}`, { metodo: 'DELETE' })

/** Motoristas ativos, para dizer quem estava com o caminhão (só na Frota). */
export const motoristasAtivos = (chamar: Chamar) => chamar<Motorista[]>('/api/Usuario/motoristas')

export type Fabricante = { id: number; nome: string }
export type Modelo = { id: number; nome: string; fabricante: { id: number; nome: string } | null }
export type Geracao = {
  id: number
  nome: string
  modelo: { id: number; nome: string } | null
  anoInicio: number
  anoFim: number | null
  normaEmissao: string
  motor: string | null
  caixa: string | null
  /** Da menor para a maior. */
  potencias: { id: number; cv: number }[]
}

export const fabricantes = (chamar: Chamar) => chamar<Fabricante[]>('/api/Fabricante')
export const modelos = (chamar: Chamar) => chamar<Modelo[]>('/api/Modelo')
export const geracoes = (chamar: Chamar) => chamar<Geracao[]>('/api/Geracao')
