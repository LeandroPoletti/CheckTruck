import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import {
  usuarios as usuariosSeed,
  veiculosSeed,
  registrosManutencaoSeed,
  chamadosSeed,
  fabricantes as fabricantesSeed,
  geracoes as geracoesSeed,
  modelos as modelosSeed,
  tiposManutencao as tiposManutencaoSeed,
  intervalos as intervalosSeed,
} from '../data/mockData'

const AppContext = createContext(null)

let nextId = 1000
function uid(prefix) {
  nextId += 1
  return `${prefix}-${nextId}`
}

const SESSION_KEY = 'checktruck.session'

export function AppProvider({ children }) {
  const [userId, setUserId] = useState(() => {
    try {
      return localStorage.getItem(SESSION_KEY) || null
    } catch {
      return null
    }
  })

  const [usuarios, setUsuarios] = useState(usuariosSeed)
  const user = usuarios.find((u) => u.id === userId) || null
  const [veiculos, setVeiculos] = useState(veiculosSeed)
  const [registros, setRegistros] = useState(registrosManutencaoSeed)
  const [chamados, setChamados] = useState(chamadosSeed)
  const [fabricantes, setFabricantes] = useState(fabricantesSeed)
  const [geracoes, setGeracoes] = useState(geracoesSeed)
  const [modelos, setModelos] = useState(modelosSeed)
  const [tiposManutencao, setTiposManutencao] = useState(tiposManutencaoSeed)
  const [intervalos, setIntervalos] = useState(intervalosSeed)

  const login = useCallback((email, senha) => {
    const found = usuarios.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha
    )
    if (!found) return { ok: false, error: 'E-mail ou senha inválidos.' }
    if (!found.ativo) return { ok: false, error: 'Esta conta está inativa. Fale com o gerente.' }
    setUserId(found.id)
    try { localStorage.setItem(SESSION_KEY, found.id) } catch { /* noop */ }
    return { ok: true, user: found }
  }, [usuarios])

  const logout = useCallback(() => {
    setUserId(null)
    try { localStorage.removeItem(SESSION_KEY) } catch { /* noop */ }
  }, [])

  const addVeiculo = useCallback((veiculo) => {
    const novo = { id: uid('v'), ativo: true, ...veiculo }
    setVeiculos((prev) => [novo, ...prev])
    return novo
  }, [])

  const updateVeiculo = useCallback((id, patch) => {
    setVeiculos((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }, [])

  const addPessoa = useCallback((pessoa) => {
    const novo = { id: uid('u'), ativo: true, ...pessoa }
    setUsuarios((prev) => [novo, ...prev])
    return novo
  }, [])

  const updatePessoa = useCallback((id, patch) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }, [])

  const addRegistroManutencao = useCallback((registro) => {
    const novo = { id: uid('m'), ...registro }
    setRegistros((prev) => [novo, ...prev])
    // km_na_troca consistente com veículo (RN-05): se maior, atualiza km_atual
    setVeiculos((prev) =>
      prev.map((v) =>
        v.id === registro.veiculoId && registro.kmNaTroca > v.kmAtual
          ? { ...v, kmAtual: registro.kmNaTroca }
          : v
      )
    )
    return novo
  }, [])

  const addIntervalo = useCallback((intervalo) => {
    const novo = { ...intervalo }
    setIntervalos((prev) => [novo, ...prev])
    return novo
  }, [])

  const updateIntervalo = useCallback((modeloId, tipoId, patch) => {
    setIntervalos((prev) =>
      prev.map((it) => (it.modeloId === modeloId && it.tipoId === tipoId ? { ...it, ...patch } : it))
    )
  }, [])

  const addTipoManutencao = useCallback((tipo) => {
    const novo = { id: uid('tipo'), ...tipo }
    setTiposManutencao((prev) => [...prev, novo])
    return novo
  }, [])

  const addModelo = useCallback((modelo) => {
    const novo = { id: uid('modelo'), ...modelo }
    setModelos((prev) => [...prev, novo])
    return novo
  }, [])

  const addGeracao = useCallback((geracao) => {
    const novo = { id: uid('geracao'), ...geracao }
    setGeracoes((prev) => [...prev, novo])
    return novo
  }, [])

  const addFabricante = useCallback((fabricante) => {
    const novo = { id: uid('fab'), ...fabricante }
    setFabricantes((prev) => [...prev, novo])
    return novo
  }, [])

  const abrirChamado = useCallback((chamado) => {
    const novo = {
      id: uid('c'),
      status: 'aberto',
      criadoEm: new Date().toISOString(),
      ...chamado,
    }
    setChamados((prev) => [novo, ...prev])
    return novo
  }, [])

  const updateChamado = useCallback((id, patch) => {
    setChamados((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      usuarios,
      addPessoa,
      updatePessoa,
      veiculos,
      addVeiculo,
      updateVeiculo,
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
    }),
    [
      user, login, logout,
      usuarios, addPessoa, updatePessoa,
      veiculos, addVeiculo, updateVeiculo,
      registros, addRegistroManutencao,
      chamados, abrirChamado, updateChamado,
      fabricantes, geracoes, modelos, tiposManutencao, intervalos,
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
