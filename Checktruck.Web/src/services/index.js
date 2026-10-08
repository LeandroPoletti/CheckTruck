import { api, toId } from './api'
import { criarCrud } from './crud'
import * as m from './mappers'

export { filtro } from './crud'

export const paisService = criarCrud('Pais', { fromApi: m.paisFromApi, toApi: m.paisToApi })
export const fabricanteService = criarCrud('Fabricante', { fromApi: m.fabricanteFromApi, toApi: m.fabricanteToApi })
export const geracaoService = criarCrud('GeracaoModelo', { fromApi: m.geracaoFromApi, toApi: m.geracaoToApi })
export const modeloService = criarCrud('Modelo', { fromApi: m.modeloFromApi, toApi: m.modeloToApi })
export const tipoManutencaoService = criarCrud('TipoManutencao', { fromApi: m.tipoManutencaoFromApi, toApi: m.tipoManutencaoToApi })
export const intervaloService = criarCrud('IntervaloRecomendado', { fromApi: m.intervaloFromApi, toApi: m.intervaloToApi })
export const manutencaoService = criarCrud('Manutencao', { fromApi: m.registroFromApi, toApi: m.registroToApi })
export const mecanicoService = criarCrud('Mecanico', { fromApi: m.mecanicoFromApi, toApi: m.mecanicoToApi })

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

// Chamados. Quem só abre vê os próprios; quem atende vê todos (a API filtra).
export const chamadoService = {
  async listar() {
    const { data } = await api.get('/api/Chamado')
    return data.map(m.chamadoFromApi)
  },
  // Caminhões ativos ({ id, placa }) para escolher ao abrir: não precisa de "Ver frota"
  async listarVeiculos() {
    const { data } = await api.get('/api/Chamado/veiculos')
    return data.map((v) => ({ id: toId(v.id), placa: v.placa }))
  },
  async abrir(dados) {
    await api.post('/api/Chamado', m.chamadoToApi(dados))
  },
  async editar(id, dados) {
    await api.put(`/api/Chamado/${id}`, m.chamadoToApi(dados))
  },
  async excluir(id) {
    await api.delete(`/api/Chamado/${id}`)
  },
  async atender(id) {
    await api.post(`/api/Chamado/${id}/atender`)
  },
  async resolver(id, solucao) {
    await api.post(`/api/Chamado/${id}/resolver`, { solucao: solucao.trim() })
  },
}

// Acessos (login, cargo e permissões). Listar, criar e editar: só Admin e Gestor.
export const usuarioService = {
  // Quem está logado, com cargo e permissões
  async obterMe() {
    const { data } = await api.get('/api/Usuario/me')
    return m.usuarioFromApi(data)
  },
  async listar() {
    const { data } = await api.get('/api/Usuario')
    return data.map(m.usuarioFromApi)
  },
  async criar(dados) {
    const { data } = await api.post('/api/Usuario', m.usuarioToApi(dados))
    return m.usuarioFromApi(data)
  },
  async atualizar(id, dados) {
    const { data } = await api.put(`/api/Usuario/${id}`, m.usuarioToApi(dados))
    return m.usuarioFromApi(data)
  },
  // Corpo é só true/false; vai como texto JSON porque o axios não manda false sozinho
  async alterarAtivo(id, ativo) {
    await api.put(`/api/Usuario/${id}/ativo`, JSON.stringify(ativo), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
  // Motoristas ativos ({ id, nome }), para escolher quem está com o caminhão
  async listarMotoristas() {
    const { data } = await api.get('/api/Usuario/motoristas')
    return data
  },
}

export const authService = {
  // → { tokenType, accessToken, expiresIn, refreshToken }
  async login(email, senha) {
    const { data } = await api.post('/api/Auth/login', { email: email.trim(), senha })
    return data
  },
}
