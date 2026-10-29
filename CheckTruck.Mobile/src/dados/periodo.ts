import { dataDoCampo } from './formato'

// Filtro de período das ordens de serviço, pela data da troca. Igual ao site.

export type Periodo = 'tudo' | 'mes' | 'tresMeses' | 'ano' | 'datas'

export const PERIODOS: { id: Periodo; nome: string }[] = [
  { id: 'tudo', nome: 'Tudo' },
  { id: 'mes', nome: 'Este mês' },
  { id: 'tresMeses', nome: 'Últimos 3 meses' },
  { id: 'ano', nome: 'Este ano' },
  { id: 'datas', nome: 'Escolher datas' },
]

/** De e Até do jeito que a pessoa digita (dd/mm/aaaa): enquanto a data não está completa, ela não conta. */
export type FiltroDePeriodo = { periodo: Periodo; de: string; ate: string }

/** Começo dos filtros: todas as OS. */
export const TODO_O_PERIODO: FiltroDePeriodo = { periodo: 'tudo', de: '', ate: '' }

const doisDigitos = (n: number) => String(n).padStart(2, '0')
const paraData = (d: Date) => `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`

/** Primeiro e último dia do período em aaaa-mm-dd (null = sem limite), contando de hoje no fuso do celular. */
export function limitesDoPeriodo({ periodo, de, ate }: FiltroDePeriodo): [string | null, string | null] {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  if (periodo === 'mes') return [paraData(new Date(ano, mes, 1)), paraData(new Date(ano, mes + 1, 0))]
  if (periodo === 'tresMeses') {
    // O mesmo dia, 3 meses atrás (em 31/05, o último dia de fevereiro)
    const ultimoDiaDoMes = new Date(ano, mes - 2, 0).getDate()
    return [paraData(new Date(ano, mes - 3, Math.min(hoje.getDate(), ultimoDiaDoMes))), paraData(hoje)]
  }
  if (periodo === 'ano') return [`${ano}-01-01`, `${ano}-12-31`]
  if (periodo === 'datas') return [dataDoCampo(de), dataDoCampo(ate)]
  return [null, null]
}

/** A data da troca (aaaa-mm-dd, ou com a hora, como vem da API) está dentro do período escolhido? */
export function noPeriodo(data: string, filtro: FiltroDePeriodo) {
  const [inicio, fim] = limitesDoPeriodo(filtro)
  const dia = data.slice(0, 10)
  return (!inicio || dia >= inicio) && (!fim || dia <= fim)
}

/** O que está errado nas datas digitadas (vazio quando está tudo certo). */
export function erroDoPeriodo({ periodo, de, ate }: FiltroDePeriodo) {
  if (periodo !== 'datas') return ''
  const naoExiste = (texto: string) => texto.length === 10 && !dataDoCampo(texto)
  if (naoExiste(de)) return 'A data De não existe. Confira o dia e o mês.'
  if (naoExiste(ate)) return 'A data Até não existe. Confira o dia e o mês.'
  const inicio = dataDoCampo(de)
  const fim = dataDoCampo(ate)
  return inicio && fim && inicio > fim ? 'A data De tem que ser antes da data Até.' : ''
}
