import { criarCrudService } from './crud'
import { motoristaFromApi, pessoaToApi } from './pessoaMappers'

export const motoristaService = criarCrudService('Motorista', {
  fromApi: motoristaFromApi,
  toApi: pessoaToApi,
})
