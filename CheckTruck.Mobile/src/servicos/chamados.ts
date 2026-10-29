import type { Chamar } from './sessao'
import type { Pagina } from '@/dados/pagina'

// Chamados: quem está com o caminhão abre, quem tem Atender chamados atende e resolve.

export type Chamado = {
  id: number
  veiculo: { id: number; placa: string }
  tipo: string
  urgencia: 'Baixa' | 'Media' | 'Alta'
  descricao: string
  status: 'Pendente' | 'Concluido'
  abertoPor: { id: string; nome: string }
  abertoEm: string
  atendidoPor: { id: string; nome: string } | null
  solucao: string | null
  concluidoEm: string | null
}

/** Os chamados de uma tela: todos os pendentes e os concluídos mais novos, com o total de concluídos. */
export type ChamadosDaTela = { pendentes: Chamado[]; concluidos: Pagina<Chamado> }

/** Do mais novo para o mais velho. Quem só abre recebe os próprios; quem atende recebe todos. */
export const listarChamados = (chamar: Chamar, quantosConcluidos: number) =>
  chamar<ChamadosDaTela>(`/api/Chamado?quantosConcluidos=${quantosConcluidos}`)

/** Caminhões ativos (id e placa) para escolher ao abrir. O motorista só recebe os que estão com ele. */
export const caminhoesDoChamado = (chamar: Chamar) => chamar<{ id: number; placa: string }[]>('/api/Chamado/veiculos')

export const abrirChamado = (
  chamar: Chamar,
  dados: { veiculoId: number; tipo: string; urgencia: Chamado['urgencia']; descricao: string },
) => chamar<Chamado>('/api/Chamado', { metodo: 'POST', corpo: { ...dados, descricao: dados.descricao.trim() } })

/** Grava quem está cuidando. O chamado continua pendente. */
export const atenderChamado = (chamar: Chamar, id: number) => chamar<Chamado>(`/api/Chamado/${id}/atender`, { metodo: 'POST' })

export const resolverChamado = (chamar: Chamar, id: number, solucao: string) =>
  chamar<Chamado>(`/api/Chamado/${id}/resolver`, { metodo: 'POST', corpo: { solucao: solucao.trim() } })
