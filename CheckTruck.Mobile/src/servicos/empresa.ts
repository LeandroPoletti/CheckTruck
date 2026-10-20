import type { Chamar } from './sessao'

// A empresa de quem está logado: a tela Minha empresa (Admin e Gestor). Quem cadastra as empresas é o dono do
// sistema, no web

export type Empresa = {
  nome: string
  /** Sem máscara: o CNPJ (nas contas antigas de uma pessoa só, o CPF). null na empresa do TCC. */
  documento: string | null
}

export const minhaEmpresa = (chamar: Chamar) => chamar<Empresa>('/api/Empresa/minha')
