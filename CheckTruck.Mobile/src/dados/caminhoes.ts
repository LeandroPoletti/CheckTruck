// Regras e nomes do cadastro do caminhão, iguais aos do web (os ids são os nomes dos enums da API)

export const ANO_MINIMO = 1900
export const anoMaximo = () => new Date().getFullYear() + 1
export const anoValido = (ano: number) => Number.isInteger(ano) && ano >= ANO_MINIMO && ano <= anoMaximo()

export const TRACOES = [
  { id: 'QuatroPorDois', nome: '4x2' },
  { id: 'SeisPorDois', nome: '6x2' },
  { id: 'SeisPorQuatro', nome: '6x4' },
  { id: 'OitoPorDois', nome: '8x2' },
  { id: 'OitoPorQuatro', nome: '8x4' },
]

export const NORMAS: Record<string, string> = {
  AntesDoEuro5: 'Antes do Euro 5',
  Euro5: 'Euro 5 (P7)',
  Euro6: 'Euro 6 (P8)',
}

// De onde veio cada mudança no histórico de km
export const ORIGENS_KM: Record<string, string> = {
  Cadastro: 'Cadastro',
  AtualizarKm: 'Atualizar km',
  OrdemServico: 'OS',
  Edicao: 'Editar caminhão',
  Correcao: 'Correção',
}

/** Põe o hífen e deixa maiúscula enquanto a pessoa digita: "abc1d23" vira "ABC-1D23". */
export function formatarPlaca(texto: string) {
  const limpa = texto.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 7)
  return limpa.length > 3 ? `${limpa.slice(0, 3)}-${limpa.slice(3)}` : limpa
}

/** Placa antiga (ABC-1234) ou Mercosul (ABC-1D23). */
export const placaValida = (placa: string) => /^[A-Z]{3}-\d[A-Z\d]\d{2}$/.test(placa)
