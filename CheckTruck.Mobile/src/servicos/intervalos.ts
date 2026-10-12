import type { Chamar } from './sessao'

// Intervalos de troca, igual à tela Intervalos do web. Vale o primeiro que existir: do caminhão → da empresa →
// de fábrica → padrão do sistema. O do caminhão (api/IntervaloVeiculo) vale só para ele; o da empresa
// (api/IntervaloRecomendado) vale para todos os caminhões da geração. Ver: estar logado. Mudar: permissão Intervalos.

export type Origem = 'caminhao' | 'empresa' | 'fabrica' | 'padrao'

export type Intervalo = {
  origem: Origem
  /** Id do cadastro; null no padrão do sistema. */
  id: number | null
  intervaloKm: number
  /** Km da 1ª troca (amaciamento); 0 = igual ao intervalo. */
  intervaloKmPrimeira: number
  /** Prazo máximo entre trocas; 0 = vence só por km. */
  intervaloMeses: number
  fonte: string | null
  observacao: string | null
}

/** Um item com os intervalos que existem para ele, na ordem em que valem: o primeiro é o que vale. */
export type IntervalosDoItem = { tipoManutencaoId: number; emOrdem: Intervalo[] }

/** Caminhão ativo, com a geração (de onde ele herda o intervalo da empresa). */
export type CaminhaoDoIntervalo = {
  id: number
  placa: string
  fabricanteNome: string
  modeloNome: string
  geracaoId: number
  geracaoNome: string
  potenciaCv: number
}

/** De quem é o intervalo: de um caminhão só ou da geração (o da empresa). */
export type Alvo = { tipo: 'caminhao' | 'geracao'; id: number }

export type DadosDoIntervalo = {
  intervaloKm: number
  intervaloKmPrimeira: number
  intervaloMeses: number
  fonte: string
  observacao: string
}

const rota = (alvo: Alvo) => `/api/${alvo.tipo === 'caminhao' ? 'IntervaloVeiculo' : 'IntervaloRecomendado'}`

/** Os intervalos de fábrica e da empresa cadastrados (no Catálogo, para contar os de cada geração). */
export const intervalosRecomendados = (chamar: Chamar) =>
  chamar<{ id: number; geracao: { id: number } | null }[]>('/api/IntervaloRecomendado')

/** Os caminhões ativos (permissão Intervalos, sem precisar de Ver frota). */
export const caminhoesDosIntervalos = (chamar: Chamar) => chamar<CaminhaoDoIntervalo[]>('/api/IntervaloVeiculo/veiculos')

/** Cada item com os intervalos na ordem em que valem para o caminhão ou para a geração. */
export const intervalosDe = (chamar: Chamar, alvo: Alvo) => chamar<IntervalosDoItem[]>(`${rota(alvo)}/tabela/${alvo.id}`)

/** Cria (sem id) ou muda o intervalo. O do caminhão não tem km da 1ª troca nem fonte. */
export function salvarIntervalo(chamar: Chamar, alvo: Alvo, tipoManutencaoId: number, dados: DadosDoIntervalo, id?: number) {
  const corpo = alvo.tipo === 'caminhao'
    ? {
        veiculoId: alvo.id,
        tipoManutencaoId,
        intervaloKm: dados.intervaloKm,
        intervaloMeses: dados.intervaloMeses,
        observacao: dados.observacao.trim() || null,
      }
    : { geracaoId: alvo.id, tipoManutencaoId, ...dados, fonte: dados.fonte.trim(), observacao: dados.observacao.trim() }
  return chamar<Intervalo>(id ? `${rota(alvo)}/${id}` : rota(alvo), { metodo: id ? 'PUT' : 'POST', corpo })
}

export const excluirIntervalo = (chamar: Chamar, alvo: Alvo, id: number) =>
  chamar<void>(`${rota(alvo)}/${id}`, { metodo: 'DELETE' })
