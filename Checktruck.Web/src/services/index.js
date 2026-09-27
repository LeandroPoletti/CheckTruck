import { api } from './api'
import { criarCrud } from './crud'
import * as m from './mappers'
import { ENDPOINTS_PENDENTES, avisarPendente, rejeitarPendente } from './pendentes'

export { filtro } from './crud'

export const paisService = criarCrud('Pais', { fromApi: m.paisFromApi, toApi: m.paisToApi })
export const fabricanteService = criarCrud('Fabricante', { fromApi: m.fabricanteFromApi, toApi: m.fabricanteToApi })
export const geracaoService = criarCrud('GeracaoModelo', { fromApi: m.geracaoFromApi, toApi: m.geracaoToApi })
export const modeloService = criarCrud('Modelo', { fromApi: m.modeloFromApi, toApi: m.modeloToApi })
export const tipoManutencaoService = criarCrud('TipoManutencao', { fromApi: m.tipoManutencaoFromApi, toApi: m.tipoManutencaoToApi })
export const intervaloService = criarCrud('IntervaloRecomendado', { fromApi: m.intervaloFromApi, toApi: m.intervaloToApi })
export const manutencaoService = criarCrud('Manutencao', { fromApi: m.registroFromApi, toApi: m.registroToApi })
export const motoristaService = criarCrud('Motorista', { fromApi: m.motoristaFromApi, toApi: m.pessoaToApi })
export const tecnicoService = criarCrud('Tecnico', { fromApi: m.tecnicoFromApi, toApi: m.pessoaToApi })

export const veiculoService = {
  ...criarCrud('Veiculo', { fromApi: m.veiculoFromApi, toApi: m.veiculoToApi }),
  // Lista com modelo, geração, motorista e situação de manutenção já calculada pela API
  async listarSituacao({ apenasAtivos = false } = {}) {
    const { data } = await api.get('/api/Veiculo/situacao', { params: { apenasAtivos } })
    return data.map(m.veiculoSituacaoFromApi)
  },
  // A API recebe a distância percorrida (km a somar), não o km absoluto.
  async somarKm(id, distancia) {
    await api.put(`/api/Veiculo/${id}/kilometragem`, distancia, {
      headers: { 'Content-Type': 'application/json' },
    })
  },
}

export const dashboardService = {
  // limiteAlertas: máximo de alertas (item mais urgente por veículo); sem valor, todos
  async obter(limiteAlertas) {
    const { data } = await api.get('/api/Dashboard', { params: { limiteAlertas } })
    return m.dashboardFromApi(data)
  },
}

// Chamados ainda não existem na API: listar devolve [] e as escritas rejeitam com aviso.
export const chamadoService = {
  async listar() {
    avisarPendente(ENDPOINTS_PENDENTES.chamadoListar)
    return []
  },
  criar: () => rejeitarPendente(ENDPOINTS_PENDENTES.chamadoCriar),
  atualizar: () => rejeitarPendente(ENDPOINTS_PENDENTES.chamadoAtualizar),
}

// Contas de usuário (Identity + papel) ainda não têm endpoints na API.
export const usuarioService = {
  criar: () => rejeitarPendente(ENDPOINTS_PENDENTES.usuarioCriar),
  atualizar: () => rejeitarPendente(ENDPOINTS_PENDENTES.usuarioAtualizar),
}

// Endpoints do ASP.NET Identity (MapIdentityApi em /identity).
export const authService = {
  // → { tokenType, accessToken, expiresIn, refreshToken }
  async login(email, senha) {
    const { data } = await api.post('/identity/login', { email: email.trim(), password: senha })
    return data
  },
}
