import type { Chamar } from './sessao'

// Cadastros que a OS usa: tipos de manutenção, mecânicos (no Autônomo, "oficinas e mecânicos") e motoristas.

export type TipoDeManutencao = { id: number; nome: string }
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
