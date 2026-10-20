import type { Chamar } from './sessao'

// Cadastros que a OS, o caminhão e os intervalos usam: tipos de manutenção, mecânicos, motoristas e o catálogo
// (fabricante → modelo → geração, com as potências).
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

/** Todos, ativos e inativos (tela Mecânicos). */
export const listarMecanicos = (chamar: Chamar) => chamar<Mecanico[]>('/api/Mecanico')
export const mecanico = (chamar: Chamar, id: number) => chamar<Mecanico>(`/api/Mecanico/${id}`)

export const mecanicosAtivos = (chamar: Chamar) =>
  chamar<Mecanico[]>(`/api/Mecanico?$filter=${encodeURIComponent('Ativo eq true')}`)

/** Cria (sem id) ou muda um mecânico. */
export const salvarMecanico = (chamar: Chamar, { nome, funcao, ativo }: Omit<Mecanico, 'id'>, id?: number) =>
  chamar<Mecanico>(id ? `/api/Mecanico/${id}` : '/api/Mecanico', {
    metodo: id ? 'PUT' : 'POST',
    corpo: { nome: nome.trim(), funcao: funcao.trim(), ativo },
  })

/** A API recusa quando já tem OS lançada com ele: aí é desativar. */
export const excluirMecanico = (chamar: Chamar, id: number) => chamar<void>(`/api/Mecanico/${id}`, { metodo: 'DELETE' })

/** Motoristas ativos, para dizer quem estava com o caminhão. */
export const motoristasAtivos = (chamar: Chamar) => chamar<Motorista[]>('/api/Usuario/motoristas')

// Catálogo: o do sistema todas as empresas veem e só o dono do sistema muda; o que a empresa cadastra (doSistema
// false) só ela vê e muda. Excluir: a API recusa país com fabricante, fabricante e modelo com geração, e geração
// com caminhão ou intervalo.

type Resumo = { id: number; nome: string }

export type Pais = Resumo & { doSistema: boolean }
export type Fabricante = Resumo & { doSistema: boolean; paisOrigem: Resumo | null }
export type Modelo = Resumo & { doSistema: boolean; fabricante: Resumo | null }
export type Geracao = Resumo & {
  doSistema: boolean
  modelo: Resumo | null
  fabricante: Resumo | null
  /** Primeiro ano-modelo vendido no Brasil. */
  anoInicio: number
  /** Último ano-modelo; null = ainda é vendida. */
  anoFim: number | null
  normaEmissao: string
  motor: string | null
  caixa: string | null
  /** Da menor para a maior. */
  potencias: { id: number; cv: number }[]
}
export type NovaGeracao = {
  nome: string
  modeloId: number
  anoInicio: number
  anoFim: number | null
  normaEmissao: string
  motor: string
  caixa: string
  /** Só os cv: a API acrescenta e tira o que mudou. */
  potencias: number[]
}

export const paises = (chamar: Chamar) => chamar<Pais[]>('/api/Pais')
export const cadastrarPais = (chamar: Chamar, nome: string) =>
  chamar<Pais>('/api/Pais', { metodo: 'POST', corpo: { nome: nome.trim() } })

export const fabricantes = (chamar: Chamar) => chamar<Fabricante[]>('/api/Fabricante')
export const buscarFabricante = (chamar: Chamar, id: number) => chamar<Fabricante>(`/api/Fabricante/${id}`)
export const salvarFabricante = (chamar: Chamar, nome: string, paisOrigemId: number, id?: number) =>
  chamar<Fabricante>(id ? `/api/Fabricante/${id}` : '/api/Fabricante', {
    metodo: id ? 'PUT' : 'POST',
    corpo: { nome: nome.trim(), paisOrigemId },
  })
export const excluirFabricante = (chamar: Chamar, id: number) => chamar<void>(`/api/Fabricante/${id}`, { metodo: 'DELETE' })

export const modelos = (chamar: Chamar) => chamar<Modelo[]>('/api/Modelo')
export const buscarModelo = (chamar: Chamar, id: number) => chamar<Modelo>(`/api/Modelo/${id}`)
export const salvarModelo = (chamar: Chamar, nome: string, fabricanteId: number, id?: number) =>
  chamar<Modelo>(id ? `/api/Modelo/${id}` : '/api/Modelo', {
    metodo: id ? 'PUT' : 'POST',
    corpo: { nome: nome.trim(), fabricanteId },
  })
export const excluirModelo = (chamar: Chamar, id: number) => chamar<void>(`/api/Modelo/${id}`, { metodo: 'DELETE' })

export const geracoes = (chamar: Chamar) => chamar<Geracao[]>('/api/Geracao')
export const buscarGeracao = (chamar: Chamar, id: number) => chamar<Geracao>(`/api/Geracao/${id}`)
export const salvarGeracao = (chamar: Chamar, g: NovaGeracao, id?: number) =>
  chamar<Geracao>(id ? `/api/Geracao/${id}` : '/api/Geracao', {
    metodo: id ? 'PUT' : 'POST',
    corpo: { ...g, nome: g.nome.trim(), motor: g.motor.trim() || null, caixa: g.caixa.trim() || null },
  })
export const excluirGeracao = (chamar: Chamar, id: number) => chamar<void>(`/api/Geracao/${id}`, { metodo: 'DELETE' })
