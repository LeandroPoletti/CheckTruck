import type { Chamar } from './sessao'

// Cadastros que a OS, o caminhão e os intervalos usam: tipos de manutenção, mecânicos (no Autônomo, "oficinas e
// mecânicos"), motoristas e o catálogo (fabricante → modelo → geração, com as potências).

/** componente: o número do enum Componente da API (nomes em dados/intervalos). */
export type TipoDeManutencao = { id: number; nome: string; componente: number }
export type Mecanico = { id: number; nome: string; funcao: string }
export type Motorista = { id: string; nome: string }

export const tiposDeManutencao = (chamar: Chamar) => chamar<TipoDeManutencao[]>('/api/TipoManutencao')

export const mecanicosAtivos = (chamar: Chamar) =>
  chamar<Mecanico[]>(`/api/Mecanico?$filter=${encodeURIComponent('Ativo eq true')}`)

/** Cadastrar exige a permissão Cadastros. */
export const cadastrarMecanico = (chamar: Chamar, nome: string, funcao: string) =>
  chamar<Mecanico>('/api/Mecanico', { metodo: 'POST', corpo: { nome: nome.trim(), funcao: funcao.trim(), ativo: true } })

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
