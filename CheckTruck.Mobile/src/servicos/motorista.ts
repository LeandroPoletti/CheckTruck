import type { Chamar } from './sessao'

// O que o motorista usa da API: os caminhões que estão com ele (GET api/MeusCaminhoes), o km deles e os chamados.

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

export type Caminhao = {
  id: number
  placa: string
  kmAtual: number
  fabricante: string
  modelo: { id: number; nome: string }
  geracao: { id: number; nome: string }
  potenciaCv: number
  status: Status
  /** Do mais urgente para o menos urgente. */
  itens: ItemDeTroca[]
}

export type Chamado = {
  id: number
  veiculo: { id: number; placa: string }
  tipo: string
  urgencia: 'Baixa' | 'Media' | 'Alta'
  descricao: string
  status: 'Pendente' | 'Concluido'
  abertoEm: string
  atendidoPor: { id: string; nome: string } | null
  solucao: string | null
}

export const meusCaminhoes = (chamar: Chamar) => chamar<Caminhao[]>('/api/MeusCaminhoes')

/** A API recebe quanto o caminhão rodou desde o último km registrado. */
export const atualizarKm = (chamar: Chamar, veiculoId: number, kmDoPainel: number, kmAtual: number) =>
  chamar<void>(`/api/MeusCaminhoes/${veiculoId}/kilometragem`, { metodo: 'PUT', corpo: kmDoPainel - kmAtual })

/** O motorista recebe só os chamados que ele abriu, do mais novo para o mais velho. */
export const meusChamados = (chamar: Chamar) => chamar<Chamado[]>('/api/Chamado')

export const abrirChamado = (
  chamar: Chamar,
  dados: { veiculoId: number; tipo: string; urgencia: Chamado['urgencia']; descricao: string },
) => chamar<Chamado>('/api/Chamado', { metodo: 'POST', corpo: { ...dados, descricao: dados.descricao.trim() } })
