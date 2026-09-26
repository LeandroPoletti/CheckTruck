import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import * as domain from '../data/domain'
import { lerSessao, salvarSessao, setOnNaoAutorizado } from '../services/api'
import {
  authService,
  fabricanteService,
  geracaoService,
  modeloService,
  tipoManutencaoService,
  intervaloService,
  veiculoService,
  manutencaoService,
  motoristaService,
  tecnicoService,
} from '../services'
import { ENDPOINTS_PENDENTES, avisarPendente, avisarTodosPendentes, rejeitarPendente } from '../services/pendentes'

const AppContext = createContext(null)

// Sem GET /api/Usuario/me não dá para saber o perfil do usuário logado: todo login entra como gerente.
function usuarioDaSessao(sessao) {
  if (!sessao) return null
  avisarPendente(ENDPOINTS_PENDENTES.usuarioMe)
  return { id: null, nome: sessao.usuario, email: sessao.usuario, perfil: 'gerente', ativo: true }
}

export function AppProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao)
  const user = useMemo(() => usuarioDaSessao(sessao), [sessao])

  const [carregando, setCarregando] = useState(() => !!lerSessao())
  const [erro, setErro] = useState(null)

  const [fabricantes, setFabricantes] = useState([])
  const [geracoes, setGeracoes] = useState([])
  const [modelos, setModelos] = useState([])
  const [tiposManutencao, setTiposManutencao] = useState([])
  const [intervalos, setIntervalos] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [registros, setRegistros] = useState([])
  const [motoristas, setMotoristas] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const usuarios = useMemo(() => [...motoristas, ...tecnicos], [motoristas, tecnicos])
  // Chamados ainda não existem na API (ver services/pendentes.js)
  const chamados = useMemo(() => [], [])

  const logout = useCallback(() => {
    salvarSessao(null)
    setSessao(null)
  }, [])

  useEffect(() => {
    setOnNaoAutorizado(logout)
    return () => setOnNaoAutorizado(null)
  }, [logout])

  const recarregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [fab, ger, mod, tipos, ints, veics, regs, mots, tecs] = await Promise.all([
        fabricanteService.listar(),
        geracaoService.listar(),
        modeloService.listar(),
        tipoManutencaoService.listar(),
        intervaloService.listar(),
        veiculoService.listar(),
        manutencaoService.listar(),
        motoristaService.listar(),
        tecnicoService.listar(),
      ])
      setFabricantes(fab)
      setGeracoes(ger)
      setModelos(mod)
      setTiposManutencao(tipos)
      setIntervalos(ints)
      setVeiculos(veics)
      setRegistros(regs)
      setMotoristas(mots)
      setTecnicos(tecs)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (!sessao) return
    avisarTodosPendentes()
    recarregar()
  }, [sessao, recarregar])

  const login = useCallback(async (usuario, senha) => {
    try {
      const token = await authService.login(usuario, senha)
      const nova = { usuario: usuario.trim(), accessToken: token.accessToken, refreshToken: token.refreshToken }
      salvarSessao(nova)
      setSessao(nova)
      return { ok: true, user: usuarioDaSessao(nova) }
    } catch (e) {
      return { ok: false, error: e.status === 401 ? 'Usuário ou senha inválidos.' : e.message }
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Veículos
  // ---------------------------------------------------------------------------
  const addVeiculo = useCallback(async (veiculo) => {
    const novo = await veiculoService.criar(veiculo)
    setVeiculos((prev) => [novo, ...prev])
    return novo
  }, [])

  // A API exige o DTO completo no PUT: mescla o patch com o veículo atual.
  const updateVeiculo = useCallback(async (id, patch) => {
    const atual = veiculos.find((v) => v.id === id)
    const atualizado = await veiculoService.atualizar(id, { ...atual, ...patch })
    setVeiculos((prev) => prev.map((v) => (v.id === id ? atualizado : v)))
    return atualizado
  }, [veiculos])

  const atualizarKm = useCallback(async (id, novoKm) => {
    const atual = veiculos.find((v) => v.id === id)
    await veiculoService.somarKm(id, novoKm - atual.kmAtual)
    setVeiculos((prev) => prev.map((v) => (v.id === id ? { ...v, kmAtual: novoKm } : v)))
  }, [veiculos])

  // ---------------------------------------------------------------------------
  // Manutenções
  // ---------------------------------------------------------------------------
  const addRegistroManutencao = useCallback(async (registro) => {
    const novo = await manutencaoService.criar(registro)
    setRegistros((prev) => [novo, ...prev])
    // km_na_troca consistente com veículo (RN-05): se maior, atualiza km_atual
    const veiculo = veiculos.find((v) => v.id === registro.veiculoId)
    if (veiculo && registro.kmNaTroca > veiculo.kmAtual) {
      await atualizarKm(veiculo.id, registro.kmNaTroca)
    }
    return novo
  }, [veiculos, atualizarKm])

  // ---------------------------------------------------------------------------
  // Catálogo
  // ---------------------------------------------------------------------------
  const addIntervalo = useCallback(async (intervalo) => {
    const novo = await intervaloService.criar(intervalo)
    setIntervalos((prev) => [novo, ...prev])
    return novo
  }, [])

  const updateIntervalo = useCallback(async (modeloId, tipoId, patch) => {
    const atual = intervalos.find((it) => it.modeloId === modeloId && it.tipoId === tipoId)
    const atualizado = await intervaloService.atualizar(atual.id, { ...atual, ...patch })
    setIntervalos((prev) => prev.map((it) => (it.id === atual.id ? atualizado : it)))
    return atualizado
  }, [intervalos])

  const addTipoManutencao = useCallback(async (tipo) => {
    const novo = await tipoManutencaoService.criar(tipo)
    setTiposManutencao((prev) => [...prev, novo])
    return novo
  }, [])

  const addModelo = useCallback(async (modelo) => {
    const novo = await modeloService.criar(modelo)
    setModelos((prev) => [...prev, novo])
    return novo
  }, [])

  const addGeracao = useCallback(async (geracao) => {
    const novo = await geracaoService.criar(geracao)
    setGeracoes((prev) => [...prev, novo])
    return novo
  }, [])

  const addFabricante = useCallback(async (fabricante) => {
    const novo = await fabricanteService.criar(fabricante)
    setFabricantes((prev) => [...prev, novo])
    return novo
  }, [])

  // ---------------------------------------------------------------------------
  // Pendentes na API — avisam no console e rejeitam com mensagem para a UI
  // ---------------------------------------------------------------------------
  const addPessoa = useCallback(() => rejeitarPendente(ENDPOINTS_PENDENTES.usuarioCriar), [])
  const updatePessoa = useCallback(() => rejeitarPendente(ENDPOINTS_PENDENTES.usuarioAtualizar), [])
  const abrirChamado = useCallback(() => rejeitarPendente(ENDPOINTS_PENDENTES.chamadoCriar), [])
  const updateChamado = useCallback(() => rejeitarPendente(ENDPOINTS_PENDENTES.chamadoAtualizar), [])

  // ---------------------------------------------------------------------------
  // Helpers de domínio ligados ao catálogo carregado
  // ---------------------------------------------------------------------------
  const helpers = useMemo(() => {
    const catalogo = { fabricantes, geracoes, modelos, tiposManutencao, intervalos }
    return {
      getModeloCompleto: (modeloId) => domain.getModeloCompleto(catalogo, modeloId),
      getIntervalosDoModelo: (modeloId) => domain.getIntervalosDoModelo(catalogo, modeloId),
      getTipoManutencao: (tipoId) => domain.getTipoManutencao(catalogo, tipoId),
      getUltimoRegistro: domain.getUltimoRegistro,
      getHistoricoVeiculo: domain.getHistoricoVeiculo,
      getSituacaoVeiculo: (veiculo, regs) => domain.getSituacaoVeiculo(catalogo, veiculo, regs),
      getStatusGeralVeiculo: (veiculo, regs) => domain.getStatusGeralVeiculo(catalogo, veiculo, regs),
      getItemMaisUrgente: (veiculo, regs) => domain.getItemMaisUrgente(catalogo, veiculo, regs),
    }
  }, [fabricantes, geracoes, modelos, tiposManutencao, intervalos])

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      carregando,
      erro,
      recarregar,
      usuarios,
      motoristas,
      tecnicos,
      addPessoa,
      updatePessoa,
      veiculos,
      addVeiculo,
      updateVeiculo,
      atualizarKm,
      registros,
      addRegistroManutencao,
      chamados,
      abrirChamado,
      updateChamado,
      fabricantes,
      geracoes,
      modelos,
      tiposManutencao,
      intervalos,
      addIntervalo,
      updateIntervalo,
      addTipoManutencao,
      addModelo,
      addGeracao,
      addFabricante,
      ...helpers,
    }),
    [
      user, login, logout, carregando, erro, recarregar,
      usuarios, motoristas, tecnicos, addPessoa, updatePessoa,
      veiculos, addVeiculo, updateVeiculo, atualizarKm,
      registros, addRegistroManutencao,
      chamados, abrirChamado, updateChamado,
      fabricantes, geracoes, modelos, tiposManutencao, intervalos,
      addIntervalo, updateIntervalo, addTipoManutencao, addModelo, addGeracao, addFabricante,
      helpers,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
