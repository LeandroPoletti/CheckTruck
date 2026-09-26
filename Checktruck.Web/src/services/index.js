import { api } from './api'
import { criarCrud } from './crud'
import * as m from './mappers'

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
  // A API recebe a distância percorrida (km a somar), não o km absoluto.
  async somarKm(id, distancia) {
    await api.put(`/api/Veiculo/${id}/kilometragem`, distancia, {
      headers: { 'Content-Type': 'application/json' },
    })
  },
}

// Endpoints do ASP.NET Identity (MapIdentityApi em /identity).
export const authService = {
  // → { tokenType, accessToken, expiresIn, refreshToken }
  async login(email, senha) {
    const { data } = await api.post('/identity/login', { email: email.trim(), password: senha })
    return data
  },
}
