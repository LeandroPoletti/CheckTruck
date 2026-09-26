import { toId } from './api'

// Motorista e Tecnico só têm usuarioGuid + cpf na API. Nome, e-mail e status
// virão do endpoint de usuários (ver TODO em usuarioService).
function pessoaFromApi(perfil, dto) {
  return {
    id: toId(dto.id),
    key: `${perfil}-${dto.id}`,
    perfil,
    usuarioGuid: dto.usuarioGuid,
    cpf: dto.cpf,
    veiculoId: toId(dto.veiculo?.id),
    nome: null,
    email: null,
    ativo: true,
  }
}

export const motoristaFromApi = (dto) => pessoaFromApi('motorista', dto)
export const tecnicoFromApi = (dto) => pessoaFromApi('mecanico', dto)
export const pessoaToApi = (p) => ({ usuarioGuid: p.usuarioGuid, cpf: p.cpf })
