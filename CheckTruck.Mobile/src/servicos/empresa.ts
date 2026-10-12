import { chamarApi } from './api'
import type { Chamar } from './sessao'

// A conta do cliente no CheckTruck: criar (sem estar logado, igual ao web) e a tela Minha empresa (Admin e Gestor)

export type TipoConta = 'Frota' | 'Autonomo'

export type NovaConta = {
  tipoConta: TipoConta
  /** Só na Frota. */
  nomeEmpresa: string
  /** Só na Frota. Com ou sem máscara; a API aceita o CNPJ com letras. */
  cnpj: string
  nome: string
  cpf: string
  email: string
  senha: string
}

export type Empresa = {
  nome: string
  tipoConta: TipoConta
  /** Sem máscara: CNPJ (Frota) ou CPF (Autônomo); quem virou Frota continua com o CPF. null na empresa do TCC. */
  documento: string | null
}

/** Cria a empresa e o primeiro acesso (Admin). Depois é só entrar com o e-mail e a senha. */
export function criarConta(conta: NovaConta) {
  const frota = conta.tipoConta === 'Frota'
  return chamarApi<void>('/api/Auth/criar-conta', {
    metodo: 'POST',
    corpo: {
      tipoConta: conta.tipoConta,
      nomeEmpresa: frota ? conta.nomeEmpresa.trim() : null,
      cnpj: frota ? conta.cnpj.trim() : null,
      nome: conta.nome.trim(),
      cpf: conta.cpf.trim(),
      email: conta.email.trim(),
      senha: conta.senha,
    },
  })
}

export const minhaEmpresa = (chamar: Chamar) => chamar<Empresa>('/api/Empresa/minha')

/** O Autônomo vira Frota: ganha acessos (motoristas, mecânicos, gestor) e chamados. Não volta. */
export const virarFrota = (chamar: Chamar) => chamar<Empresa>('/api/Empresa/minha/virar-frota', { metodo: 'PUT' })
