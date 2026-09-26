import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { lerSessao, salvarSessao, setOnNaoAutorizado } from '../services/api'
import {
  authService,
  paisService,
  fabricanteService,
  geracaoModeloService,
  modeloService,
  tipoManutencaoService,
  intervaloRecomendadoService,
  veiculoService,
  manutencaoService,
  motoristaService,
  tecnicoService,
  usuarioService,
  chamadoService,
} from '../services'
import { criarDominio } from '../data/domain'

const AppContext = createContext(null)

// Coleções carregadas da API após o login
const COLECOES = {
  veiculos: () => veiculoService.listar(),
  registros: () => manutencaoService.listar(),
  fabricantes: () => fabricanteService.listar(),
  geracoes: () => geracaoModeloService.listar(),
  modelos: () => modeloService.listar(),
  tiposManutencao: () => tipoManutencaoService.listar(),
  intervalos: () => intervaloRecomendadoService.listar(),
  paises: () => paisService.listar(),
  motoristas: () => motoristaService.listar(),
  tecnicos: () => tecnicoService.listar(),
  chamados: () => chamadoService.listar(),
}

const DADOS_VAZIOS = Object.fromEntries(Object.keys(COLECOES).map((k) => [k, []]))

export function AppProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao)
  const user = sessao?.user || null

  const [dados, setDados] = useState(DADOS_VAZIOS)
  const [carregando, setCarregando] = useState(!!user)
  const [erroCarga, setErroCarga] = useState(null)

  const dadosRef = useRef(dados)
  useEffect(() => { dadosRef.current = dados }, [dados])

  const recarregar = useCallback(async (chaves = Object.keys(COLECOES)) => {
    const resultados = await Promise.all(chaves.map((k) => COLECOES[k]()))
    setDados((prev) => {
      const next = { ...prev }
      chaves.forEach((k, i) => { next[k] = resultados[i] })
      return next
    })
  }, [])

  const carregarTudo = useCallback(async () => {
    setCarregando(true)
    setErroCarga(null)
    try {
      await recarregar()
    } catch (e) {
      setErroCarga(e.message)
    } finally {
      setCarregando(false)
    }
  }, [recarregar])

  const logout = useCallback(() => {
    salvarSessao(null)
    setSessao(null)
    setDados(DADOS_VAZIOS)
  }, [])

  useEffect(() => {
    setOnNaoAutorizado(logout)
    return () => setOnNaoAutorizado(null)
  }, [logout])

  const userKey = user?.email
  useEffect(() => {
    if (userKey) carregarTudo()
  }, [userKey, carregarTudo])

  const login = useCallback(async (usuario, senha) => {
    try {
      const tokens = await authService.login(usuario, senha)
      salvarSessao({ token: tokens.accessToken, refreshToken: tokens.refreshToken })

      const info = await authService.obterInfo().catch(() => null)
      const me = await usuarioService.obterMe()
      if (me && me.ativo === false) {
        salvarSessao(null)
        return { ok: false, error: 'Esta conta está inativa. Fale com o gerente.' }
      }

      const novoUser = {
        id: me?.id ?? null,
        email: me?.email ?? info?.email ?? usuario.trim(),
        nome: me?.nome ?? info?.email ?? usuario.trim(),
        // TODO: API — sem GET /api/Usuario/me não há como saber o perfil do usuário;
        // até lá todo login entra como gerente.
        perfil: me?.perfil ?? 'gerente',
        motoristaId: me?.motoristaId != null ? String(me.motoristaId) : null,
        tecnicoId: me?.tecnicoId != null ? String(me.tecnicoId) : null,
      }
      const novaSessao = { token: tokens.accessToken, refreshToken: tokens.refreshToken, user: novoUser }
      salvarSessao(novaSessao)
      setCarregando(true)
      setSessao(novaSessao)
      return { ok: true, user: novoUser }
    } catch (e) {
      salvarSessao(null)
      const error = e.status === 401 ? 'Usuário ou senha inválidos.' : e.message
      return { ok: false, error }
    }
  }, [])

  // -------------------------------------------------------------------------
  // Veículos e manutenções
  // -------------------------------------------------------------------------
  const addVeiculo = useCallback(async (veiculo) => {
    const novo = await veiculoService.criar({ ativo: true, ...veiculo })
    await recarregar(['veiculos', 'motoristas'])
    return novo
  }, [recarregar])

  // PUT exige o DTO completo: mescla o patch com o veículo atual
  const updateVeiculo = useCallback(async (id, patch) => {
    const atual = dadosRef.current.veiculos.find((v) => v.id === id)
    const atualizado = await veiculoService.atualizar(id, { ...atual, ...patch })
    await recarregar(['veiculos', 'motoristas'])
    return atualizado
  }, [recarregar])

  // A API recebe a distância percorrida (delta), não o km absoluto
  const atualizarKm = useCallback(async (veiculo, novoKm) => {
    const distancia = Number(novoKm) - veiculo.kmAtual
    if (distancia > 0) await veiculoService.atualizarKm(veiculo.id, distancia)
    await recarregar(['veiculos'])
  }, [recarregar])

  const addRegistroManutencao = useCallback(async (registro) => {
    const novo = await manutencaoService.criar(registro)
    // RN-05: km_na_troca maior que o km do veículo atualiza o km atual.
    // O POST /api/Manutencao não faz isso, então chamamos /kilometragem em seguida.
    const veiculo = dadosRef.current.veiculos.find((v) => v.id === registro.veiculoId)
    if (veiculo && registro.kmNaTroca > veiculo.kmAtual) {
      await veiculoService.atualizarKm(veiculo.id, registro.kmNaTroca - veiculo.kmAtual)
    }
    await recarregar(['registros', 'veiculos'])
    return novo
  }, [recarregar])

  // -------------------------------------------------------------------------
  // Catálogo e intervalos
  // -------------------------------------------------------------------------
  const criarEmColecao = useCallback((service, chave) => async (dados) => {
    const novo = await service.criar(dados)
    await recarregar([chave])
    return novo
  }, [recarregar])

  const addFabricante = useMemo(() => criarEmColecao(fabricanteService, 'fabricantes'), [criarEmColecao])
  const addGeracao = useMemo(() => criarEmColecao(geracaoModeloService, 'geracoes'), [criarEmColecao])
  const addModelo = useMemo(() => criarEmColecao(modeloService, 'modelos'), [criarEmColecao])
  const addTipoManutencao = useMemo(() => criarEmColecao(tipoManutencaoService, 'tiposManutencao'), [criarEmColecao])
  const addIntervalo = useMemo(() => criarEmColecao(intervaloRecomendadoService, 'intervalos'), [criarEmColecao])

  const updateIntervalo = useCallback(async (id, patch) => {
    const atual = dadosRef.current.intervalos.find((i) => i.id === id)
    const atualizado = await intervaloRecomendadoService.atualizar(id, { ...atual, ...patch })
    await recarregar(['intervalos'])
    return atualizado
  }, [recarregar])

  // -------------------------------------------------------------------------
  // Pessoas e conta
  // -------------------------------------------------------------------------
  const addPessoa = useCallback(async (pessoa) => {
    const nova = await usuarioService.criarPessoa(pessoa) // TODO: API — POST /api/Usuario
    await recarregar(['motoristas', 'tecnicos', 'veiculos'])
    return nova
  }, [recarregar])

  const updatePessoa = useCallback((id, patch) => {
    return usuarioService.atualizar(id, patch) // TODO: API — PUT /api/Usuario/{id}
  }, [])

  const alterarSenha = useCallback((senhaAtual, novaSenha) => {
    return authService.alterarSenha(senhaAtual, novaSenha)
  }, [])

  // -------------------------------------------------------------------------
  // Chamados (TODO: API — entidade Chamado ainda não existe)
  // -------------------------------------------------------------------------
  const abrirChamado = useCallback(async (chamado) => {
    const novo = await chamadoService.criar(chamado)
    await recarregar(['chamados'])
    return novo
  }, [recarregar])

  const updateChamado = useCallback(async (id, patch) => {
    const atualizado = await chamadoService.atualizar(id, patch)
    await recarregar(['chamados'])
    return atualizado
  }, [recarregar])

  const pessoas = useMemo(() => [...dados.motoristas, ...dados.tecnicos], [dados.motoristas, dados.tecnicos])

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      carregando,
      erroCarga,
      carregarTudo,
      recarregar,
      ...dados,
      pessoas,
      addPessoa,
      updatePessoa,
      alterarSenha,
      addVeiculo,
      updateVeiculo,
      atualizarKm,
      addRegistroManutencao,
      abrirChamado,
      updateChamado,
      addIntervalo,
      updateIntervalo,
      addTipoManutencao,
      addModelo,
      addGeracao,
      addFabricante,
    }),
    [
      user, login, logout, carregando, erroCarga, carregarTudo, recarregar,
      dados, pessoas, addPessoa, updatePessoa, alterarSenha,
      addVeiculo, updateVeiculo, atualizarKm, addRegistroManutencao,
      abrirChamado, updateChamado,
      addIntervalo, updateIntervalo, addTipoManutencao, addModelo, addGeracao, addFabricante,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// Regras de negócio ligadas ao catálogo carregado da API
export function useDominio() {
  const { fabricantes, geracoes, modelos, tiposManutencao, intervalos } = useApp()
  return useMemo(
    () => criarDominio({ fabricantes, geracoes, modelos, tiposManutencao, intervalos }),
    [fabricantes, geracoes, modelos, tiposManutencao, intervalos]
  )
}
