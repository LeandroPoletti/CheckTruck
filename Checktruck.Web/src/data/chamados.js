// Tipos de ocorrência e urgências dos chamados (os ids são os nomes dos enums TipoOcorrencia e UrgenciaChamado da API).

export const TIPOS_OCORRENCIA = [
  { id: 'RuidoMotor', nome: 'Ruído no motor' },
  { id: 'Freios', nome: 'Freios' },
  { id: 'PneuSuspensao', nome: 'Pneu / suspensão' },
  { id: 'EletricaPainel', nome: 'Elétrica / painel' },
  { id: 'Vazamento', nome: 'Vazamento' },
  { id: 'ArCondicionado', nome: 'Ar-condicionado' },
  { id: 'PreventivaVencida', nome: 'Manutenção preventiva vencida' },
  { id: 'Outro', nome: 'Outro' },
]

export const URGENCIAS = [
  { id: 'Baixa', nome: 'Baixa' },
  { id: 'Media', nome: 'Média' },
  { id: 'Alta', nome: 'Urgente' },
]

export const nomeTipoOcorrencia = (id) => TIPOS_OCORRENCIA.find((t) => t.id === id)?.nome ?? id
