// Nomes dos cargos (os ids são os do enum Cargo da API), iguais aos do web
const CARGOS: Record<string, string> = {
  Admin: 'Admin',
  Gestor: 'Gestor',
  Almoxarife: 'Almoxarife',
  Mecanico: 'Mecânico',
  ChefeManutencao: 'Chefe de Manutenção',
  TecnicoLogistica: 'Técnico de Logística',
  AuxiliarLogistica: 'Auxiliar de Logística',
  Motorista: 'Motorista',
  DonoDoSistema: 'Dono do sistema',
}

export const nomeCargo = (id: string) => CARGOS[id] ?? 'Sem cargo'
