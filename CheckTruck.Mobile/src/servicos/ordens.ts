import type { Chamar } from './sessao'
import type { Pagina } from '@/dados/pagina'

// Ordens de serviço: as trocas feitas nos caminhões. Ver: Ver frota. Lançar: Ordem de serviço.

export type OrdemDeServico = {
  id: number
  /** Número da OS na empresa (1, 2, 3...). */
  numero: number
  veiculo: { id: number; placa: string } | null
  /** Data da troca (a API guarda sem hora, em UTC). */
  realizadoEm: string
  /** Km do caminhão na troca. */
  kmAtual: number
  itens: {
    id: number
    tipoManutencao: { id: number; nome: string } | null
    kmProximaTroca: number
    dataProximaTroca: string | null
    isPrimeiraTroca: boolean
  }[]
  mecanicos: { id: number; nome: string; funcao: string }[]
  motorista: { id: string; nome: string } | null
  observacao: string | null
  concessionaria: string | null
  lancadoPor: { id: string; nome: string } | null
  /** Data e hora em que a OS foi lançada no sistema. */
  lancadoEm: string
}

export type NovaOrdem = {
  veiculoId: number
  /** aaaa-mm-dd */
  data: string
  km: number
  itens: { tipoManutencaoId: number; isPrimeiraTroca: boolean }[]
  mecanicoIds: number[]
  motoristaId: string | null
  concessionaria: string
  observacao: string
}

/** Filtros da lista de OS da frota (todos opcionais): placa ou nº da OS, e o período da troca em aaaa-mm-dd. */
export type FiltrosDasOrdens = { busca?: string | null; de?: string | null; ate?: string | null }

/** OS da frota, da troca mais nova para a mais velha, já filtradas pela API: as primeiras (quantos) e o total. */
export function ordensDaFrota(chamar: Chamar, filtros: FiltrosDasOrdens, quantos: number) {
  const params = Object.entries({ ...filtros, quantos })
    .filter(([, valor]) => valor !== null && valor !== undefined && valor !== '')
    .map(([nome, valor]) => `${nome}=${encodeURIComponent(String(valor))}`)
  return chamar<Pagina<OrdemDeServico>>(`/api/OrdemServico/pagina?${params.join('&')}`)
}

/** Para ordenar da mais nova para a mais velha (pela data da troca; no mesmo dia, a de número maior). */
export const maisNovaPrimeiro = (a: OrdemDeServico, b: OrdemDeServico) => b.realizadoEm.localeCompare(a.realizadoEm) || b.id - a.id

/** O km da maior OS (0 sem nenhuma): a correção de km do caminhão não pode ficar abaixo dele. */
export const kmDaMaiorOs = (ordens: OrdemDeServico[]) => Math.max(0, ...ordens.map((os) => os.kmAtual))

export const ordensDoCaminhao = (chamar: Chamar, veiculoId: number) =>
  chamar<OrdemDeServico[]>(`/api/OrdemServico?$filter=${encodeURIComponent(`Veiculo/Id eq ${veiculoId}`)}`)

/**
 * A próxima troca de cada item vai com km 0 e data null: a API calcula pelo intervalo que vale
 * (caminhão, empresa, fábrica ou padrão), igual ao web. O km da OS atualiza o caminhão quando é maior,
 * e o motorista escolhido vira o motorista atual do caminhão.
 */
export const lancarOrdem = (chamar: Chamar, os: NovaOrdem) =>
  chamar<OrdemDeServico>('/api/OrdemServico', {
    metodo: 'POST',
    corpo: {
      veiculoId: os.veiculoId,
      realizadoEm: `${os.data}T00:00:00Z`,
      kmAtual: os.km,
      itens: os.itens.map((i) => ({ ...i, kmProximaTroca: 0, dataProximaTroca: null })),
      mecanicoIds: os.mecanicoIds,
      motoristaId: os.motoristaId,
      concessionaria: os.concessionaria.trim() || null,
      observacao: os.observacao.trim() || null,
    },
  })
