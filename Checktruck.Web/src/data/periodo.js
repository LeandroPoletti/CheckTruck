// Filtro de período das ordens de serviço, pela data da troca (aaaa-mm-dd). Igual no site e no app.

export const PERIODOS = [
  { id: 'tudo', nome: 'Tudo' },
  { id: 'mes', nome: 'Este mês' },
  { id: 'tresMeses', nome: 'Últimos 3 meses' },
  { id: 'ano', nome: 'Este ano' },
  { id: 'datas', nome: 'Escolher datas' },
]

/** Começo dos filtros: todas as OS. Em "Escolher datas", de e ate em aaaa-mm-dd (vazia = sem limite). */
export const TODO_O_PERIODO = { periodo: 'tudo', de: '', ate: '' }

const doisDigitos = (n) => String(n).padStart(2, '0')
const paraData = (d) => `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`

/** Primeiro e último dia do período (aaaa-mm-dd; null = sem limite), contando de hoje no fuso do computador. */
export function limitesDoPeriodo({ periodo, de, ate }) {
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
  if (periodo === 'datas') return [de || null, ate || null]
  return [null, null]
}

/** A data da troca (aaaa-mm-dd) está dentro do período escolhido? */
export function noPeriodo(data, filtro) {
  const [inicio, fim] = limitesDoPeriodo(filtro)
  return (!inicio || data >= inicio) && (!fim || data <= fim)
}

/** O que está errado nas datas escolhidas (vazio quando está tudo certo). */
export function erroDoPeriodo({ periodo, de, ate }) {
  return periodo === 'datas' && de && ate && de > ate ? 'A data De tem que ser antes da data Até.' : ''
}
