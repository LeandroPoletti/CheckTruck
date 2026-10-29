import type { Chamar } from './sessao'
import type { Pagina } from '@/dados/pagina'

// Situação dos caminhões (próximas trocas em km e data), do jeito que a API calcula para o web.
// O motorista usa api/MeusCaminhoes (só os que estão com ele); quem vê a frota usa api/Veiculo.

export type Status = 'ok' | 'atencao' | 'critico'

export type ItemDeTroca = {
  tipoManutencaoId: number
  tipoManutencaoNome: string
  intervaloKm: number
  /** De onde veio o intervalo usado no cálculo. */
  origemIntervalo: 'caminhao' | 'empresa' | 'fabrica' | 'padrao'
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
  /** Desativado: fica fora da OS e dos chamados, mas continua com o histórico. */
  ativo: boolean
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

/** Caminhões da empresa, ativos e desativados (permissão Ver frota). */
export const caminhoesDaFrota = (chamar: Chamar) => chamar<CaminhaoNaLista[]>('/api/Veiculo/situacao')

export const situacaoDoCaminhao = (chamar: Chamar, id: number) => chamar<Caminhao>(`/api/Veiculo/${id}/situacao`)

/**
 * Grava o km do painel (maior que o registrado). O motorista grava pelo api/MeusCaminhoes (estar com o caminhão é
 * a permissão); os outros, pelo api/Veiculo (Atualizar km).
 */
export const atualizarKm = (chamar: Chamar, veiculoId: number, kmDoPainel: number, doMotorista: boolean) =>
  chamar<void>(`/api/${doMotorista ? 'MeusCaminhoes' : 'Veiculo'}/${veiculoId}/km`, {
    metodo: 'PUT',
    corpo: { km: kmDoPainel },
  })

/** O cadastro do caminhão, como o formulário usa (GET api/Veiculo/{id}). */
export type CadastroDoCaminhao = {
  id: number
  placa: string
  fabricante: { id: number; nome: string } | null
  modelo: { id: number; nome: string } | null
  geracao: { id: number; nome: string } | null
  potencia: { id: number; cv: number } | null
  tracao: string
  chassi: string
  renavam: string | null
  /** Só o ano vale (vem como 1º de janeiro, em UTC). */
  anoFabricacao: string
  anoModelo: string
  kmAtual: number
  ativo: boolean
  motoristaAtual: { id: string; nome: string } | null
  /** Muda a cada gravação: volta no Editar (se alguém salvou antes, a API não grava). */
  versao: number
}

export type DadosDoCaminhao = {
  potenciaId: number
  tracao: string
  placa: string
  chassi: string
  renavam: string
  anoFabricacao: number
  anoModelo: number
  kmAtual: number
  ativo: boolean
  motoristaAtualId: string | null
  /** Ao editar, a versão de quando abriu; ao cadastrar, 0. */
  versao: number
}

export const cadastroDoCaminhao = (chamar: Chamar, id: number) => chamar<CadastroDoCaminhao>(`/api/Veiculo/${id}`)

/** Cadastrar (sem id) ou editar (permissão Veículos). O ano vai como 1º de janeiro em UTC, igual ao web. */
export const salvarCaminhao = (chamar: Chamar, dados: DadosDoCaminhao, id?: number) =>
  chamar<CadastroDoCaminhao>(id ? `/api/Veiculo/${id}` : '/api/Veiculo', {
    metodo: id ? 'PUT' : 'POST',
    corpo: {
      ...dados,
      chassi: dados.chassi.trim(),
      renavam: dados.renavam || null,
      anoFabricacao: `${dados.anoFabricacao}-01-01T00:00:00Z`,
      anoModelo: `${dados.anoModelo}-01-01T00:00:00Z`,
    },
  })

/** Uma mudança no km do caminhão. kmAnterior null = cadastro; ordemServicoNumero null = não foi OS (ou a OS foi excluída). */
export type RegistroDeKm = {
  id: number
  kmAnterior: number | null
  kmNovo: number
  origem: string
  motivo: string | null
  ordemServicoNumero: number | null
  registradoPor: { id: string; nome: string } | null
  registradoEm: string
}

/** As mudanças de km, da mais nova para a mais velha: as primeiras (quantos) e o total. */
export const historicoDeKm = (chamar: Chamar, id: number, quantos: number) =>
  chamar<Pagina<RegistroDeKm>>(`/api/Veiculo/${id}/historico-km?quantos=${quantos}`)

/** Só Admin e Gestor: corrige um km digitado errado, com o motivo no histórico. */
export const corrigirKm = (chamar: Chamar, id: number, km: number, motivo: string) =>
  chamar<void>(`/api/Veiculo/${id}/corrigir-km`, { metodo: 'PUT', corpo: { km, motivo: motivo.trim() } })
