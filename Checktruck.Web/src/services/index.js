import { api, toId } from './api'
import { criarCrud } from './crud'
import * as m from './mappers'

export { filtro } from './crud'

export const paisService = criarCrud('Pais', { fromApi: m.paisFromApi, toApi: m.paisToApi })
export const fabricanteService = criarCrud('Fabricante', { fromApi: m.fabricanteFromApi, toApi: m.fabricanteToApi })
export const modeloService = criarCrud('Modelo', { fromApi: m.modeloFromApi, toApi: m.modeloToApi })
export const geracaoService = criarCrud('Geracao', { fromApi: m.geracaoFromApi, toApi: m.geracaoToApi })
export const tipoManutencaoService = criarCrud('TipoManutencao', { fromApi: m.tipoManutencaoFromApi, toApi: m.tipoManutencaoToApi })
export const intervaloService = {
  ...criarCrud('IntervaloRecomendado', { fromApi: m.intervaloFromApi, toApi: m.intervaloToApi }),
  // Tela Intervalos, aba "Por geração": cada item com os intervalos na ordem em que valem (a API manda pronto)
  async tabela(geracaoId) {
    const { data } = await api.get(`/api/IntervaloRecomendado/tabela/${geracaoId}`)
    return data.map(m.intervalosDoItemFromApi)
  },
}
export const intervaloVeiculoService = {
  ...criarCrud('IntervaloVeiculo', { fromApi: m.intervaloVeiculoFromApi, toApi: m.intervaloVeiculoToApi }),
  // Caminhões ativos (com a geração) para a tela de intervalos, sem precisar de Ver frota
  async listarVeiculos() {
    const { data } = await api.get('/api/IntervaloVeiculo/veiculos')
    return data.map(m.veiculoDoIntervaloFromApi)
  },
  // Aba "Por caminhão": cada item com os intervalos na ordem em que valem para o caminhão
  async tabela(veiculoId) {
    const { data } = await api.get(`/api/IntervaloVeiculo/tabela/${veiculoId}`)
    return data.map(m.intervalosDoItemFromApi)
  },
}
export const ordemServicoService = {
  ...criarCrud('OrdemServico', { fromApi: m.ordemServicoFromApi, toApi: m.ordemServicoToApi }),
  // OS da frota, da troca mais nova para a mais velha, já filtradas pela API: as primeiras (quantos) e o total.
  // Filtros: tipoId, busca (placa ou nº da OS), de e ate (aaaa-mm-dd). quantos 0 traz só o total.
  async listarPagina({ tipoId, busca, de, ate }, quantos) {
    const { data } = await api.get('/api/OrdemServico/pagina', { params: { tipoId, busca, de, ate, quantos } })
    return { itens: data.itens.map(m.ordemServicoFromApi), total: data.total }
  },
}
export const mecanicoService = criarCrud('Mecanico', { fromApi: m.mecanicoFromApi, toApi: m.mecanicoToApi })

export const veiculoService = {
  ...criarCrud('Veiculo', { fromApi: m.veiculoFromApi, toApi: m.veiculoToApi }),
  // Lista com fabricante, modelo, geração, potência, motorista e situação de manutenção já calculada pela API
  async listarSituacao({ apenasAtivos = false } = {}) {
    const { data } = await api.get('/api/Veiculo/situacao', { params: { apenasAtivos } })
    return data.map(m.veiculoSituacaoFromApi)
  },
  // Situação de um caminhão com todos os itens (km e dias que faltam), calculada pela API
  async obterSituacao(id) {
    const { data } = await api.get(`/api/Veiculo/${id}/situacao`)
    return m.veiculoSituacaoFromApi(data)
  },
  // O km do painel agora (maior que o registrado)
  async atualizarKm(id, km) {
    await api.put(`/api/Veiculo/${id}/km`, { km })
  },
  // As mudanças de km do caminhão, da mais nova para a mais velha: as primeiras (quantos) e o total
  async listarHistoricoKm(id, quantos) {
    const { data } = await api.get(`/api/Veiculo/${id}/historico-km`, { params: { quantos } })
    return { itens: data.itens.map(m.registroKmFromApi), total: data.total }
  },
  // Só Admin e Gestor: pode baixar o km (não abaixo da maior OS); o motivo fica no histórico
  async corrigirKm(id, km, motivo) {
    await api.put(`/api/Veiculo/${id}/corrigir-km`, { km: Number(km), motivo: motivo.trim() })
  },
}

export const dashboardService = {
  // limiteAlertas: máximo de caminhões na lista de alertas; sem valor, todos
  async obter(limiteAlertas) {
    const { data } = await api.get('/api/Dashboard', { params: { limiteAlertas } })
    return m.dashboardFromApi(data)
  },
}

// Chamados. Quem só abre vê os próprios; quem atende vê todos (a API filtra).
export const chamadoService = {
  // Todos os pendentes e os concluídos mais novos (quantosConcluidos), com o total de concluídos
  async listar(quantosConcluidos) {
    const { data } = await api.get('/api/Chamado', { params: { quantosConcluidos } })
    return {
      pendentes: data.pendentes.map(m.chamadoFromApi),
      concluidos: { itens: data.concluidos.itens.map(m.chamadoFromApi), total: data.concluidos.total },
    }
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
  // Quem está logado, com cargo, permissões, empresa e o tema de cor
  async obterMe() {
    const { data } = await api.get('/api/Usuario/me')
    return m.usuarioLogadoFromApi(data)
  },
  // O tema de cor de quem está logado (Verde, Azul, Amarelo ou Preto): vale no site e no app
  async alterarTema(tema) {
    await api.put('/api/Usuario/me/tema', JSON.stringify(tema), { headers: { 'Content-Type': 'application/json' } })
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

// Empresas (clientes do CheckTruck): listar, cadastrar, ativar/desativar e senha nova do Admin são só do dono do
// sistema. Minha empresa (a de quem está logado): só Admin e Gestor.
export const empresaService = {
  async listar() {
    const { data } = await api.get('/api/Empresa')
    return data.map(m.empresaFromApi)
  },
  // Empresa nova com o Admin dela (o login que o dono do sistema passa para o dono da empresa)
  async cadastrar(dados) {
    const { data } = await api.post('/api/Empresa', m.empresaToApi(dados))
    return m.empresaFromApi(data)
  },
  // Corpo é só true/false; vai como texto JSON porque o axios não manda false sozinho
  async alterarAtiva(id, ativa) {
    await api.put(`/api/Empresa/${id}/ativa`, JSON.stringify(ativa), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
  async definirSenhaDoAdmin(id, adminId, senha) {
    await api.put(`/api/Empresa/${id}/admins/${adminId}/senha`, { senha })
  },
  async obterMinha() {
    const { data } = await api.get('/api/Empresa/minha')
    return data
  },
}
