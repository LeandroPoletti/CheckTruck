import { criarCrudService } from './crud'
import { tecnicoFromApi, pessoaToApi } from './pessoaMappers'

export const tecnicoService = criarCrudService('Tecnico', {
  fromApi: tecnicoFromApi,
  toApi: pessoaToApi,
})
