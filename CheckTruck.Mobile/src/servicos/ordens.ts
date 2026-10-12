import type { Chamar } from './sessao'

// Ordens de serviço: as trocas feitas nos caminhões. Ver: Ver frota. Lançar: Ordem de serviço.

export type OrdemDeServico = {
  /** Número da OS. */
  id: number
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

export const listarOrdens = (chamar: Chamar) => chamar<OrdemDeServico[]>('/api/OrdemServico')

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
