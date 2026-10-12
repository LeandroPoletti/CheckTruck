import type { Chamar } from './sessao'

// Situação dos caminhões (próximas trocas em km e data), do jeito que a API calcula para o web.
// O motorista usa api/MeusCaminhoes (só os que estão com ele); quem vê a frota usa api/Veiculo.

export type Status = 'ok' | 'atencao' | 'critico'

export type ItemDeTroca = {
  tipoManutencaoId: number
  tipoManutencaoNome: string
  intervaloKm: number
  kmProximaTroca: number
  /** Negativo = já passou do km da troca. */
  kmRestante: number
  /** De 0 a 100: quanto do ciclo já foi rodado. */
  percentualUsado: number
  /** Data limite da troca (UTC); null quando o item vence só por km. */
  dataProximaTroca: string | null
  diasRestantes: number | null
  ultimaTrocaKm: number | null
  isPrimeiraTroca: boolean
  status: Status
}

/** Como vem na lista da frota: só o item mais urgente de cada caminhão. */
export type CaminhaoNaLista = {
  id: number
  placa: string
  kmAtual: number
  fabricante: string
  modelo: { id: number; nome: string }
  geracao: { id: number; nome: string }
  potenciaCv: number
  motoristaAtual: { id: string; nome: string } | null
  status: Status
  /** null quando o caminhão não tem itens de troca. */
  itemMaisUrgente: ItemDeTroca | null
}

/** Situação completa de um caminhão: todos os itens. */
export type Caminhao = CaminhaoNaLista & {
  /** Do mais urgente para o menos urgente. */
  itens: ItemDeTroca[]
}

export const meusCaminhoes = (chamar: Chamar) => chamar<Caminhao[]>('/api/MeusCaminhoes')

/** Caminhões ativos da empresa (permissão Ver frota). */
export const caminhoesDaFrota = (chamar: Chamar) => chamar<CaminhaoNaLista[]>('/api/Veiculo/situacao?apenasAtivos=true')

export const situacaoDoCaminhao = (chamar: Chamar, id: number) => chamar<Caminhao>(`/api/Veiculo/${id}/situacao`)

/**
 * A API recebe quanto o caminhão rodou desde o último km registrado. O motorista soma pelo
 * api/MeusCaminhoes (estar com o caminhão é a permissão); os outros, pelo api/Veiculo (Atualizar km).
 */
export const atualizarKm = (chamar: Chamar, veiculoId: number, kmDoPainel: number, kmAtual: number, doMotorista: boolean) =>
  chamar<void>(`/api/${doMotorista ? 'MeusCaminhoes' : 'Veiculo'}/${veiculoId}/kilometragem`, {
    metodo: 'PUT',
    corpo: kmDoPainel - kmAtual,
  })
