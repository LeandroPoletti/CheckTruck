import type { Chamar } from './sessao'

// A empresa de quem está logado: a tela Minha empresa (Admin e Gestor). Quem cadastra as empresas é o dono do
// sistema, no web

export type TipoConta = 'Frota' | 'Autonomo'

export type Empresa = {
  nome: string
  tipoConta: TipoConta
  /** Sem máscara: CNPJ (Frota) ou CPF (Autônomo); quem virou Frota continua com o CPF. null na empresa do TCC. */
  documento: string | null
}

export const minhaEmpresa = (chamar: Chamar) => chamar<Empresa>('/api/Empresa/minha')

/** O Autônomo vira Frota: ganha acessos (motoristas, mecânicos, gestor) e chamados. Não volta. */
export const virarFrota = (chamar: Chamar) => chamar<Empresa>('/api/Empresa/minha/virar-frota', { metodo: 'PUT' })
