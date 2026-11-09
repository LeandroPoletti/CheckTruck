import type { Chamar, Usuario } from '@/servicos/sessao'
import { caminhoesDaFrota, meusCaminhoes, type Caminhao, type CaminhaoNaLista } from '@/servicos/caminhoes'
import { listarChamados, type Chamado, type ChamadosDaTela } from '@/servicos/chamados'
import { CONCLUIDOS_NA_TELA } from './ChamadosDaFrota'

// A tela inicial de cada perfil e o que ela busca. Isso é buscado antes, no login (enquanto o caminhão está
// carregando) e ao abrir o app já logado (com a abertura na tela): a tela inicial já abre pronta, sem carregar de
// novo na frente da pessoa.

type TelaInicial = 'motorista' | 'frota' | 'site'
type DadosDaFrota = { caminhoes: CaminhaoNaLista[]; chamados: ChamadosDaTela }
type DadosDoMotorista = { caminhoes: Caminhao[]; chamados: Chamado[] }

/** Os chamados do motorista que aparecem na tela (os mais novos). */
const CHAMADOS_DO_MOTORISTA = 5
const SEM_CHAMADOS: ChamadosDaTela = { pendentes: [], concluidos: { itens: [], total: 0 } }

/**
 * O motorista vê o caminhão dele, e quem vê a frota ou atende chamados vê o painel da frota. Quem não tem nada disso
 * liberado (e o dono do sistema) é avisado de que o acesso é pelo site.
 */
export function telaInicialDe(usuario: Usuario): TelaInicial {
  if (usuario.cargo === 'Motorista') return 'motorista'
  const cuidaDaFrota = usuario.permissoes.includes('VerFrota') || usuario.permissoes.includes('AtenderChamados')
  return cuidaDaFrota ? 'frota' : 'site'
}

/** Painel da frota: os caminhões (Ver frota) e os chamados (Atender chamados). */
export async function buscarDadosDaFrota(chamar: Chamar, usuario: Usuario): Promise<DadosDaFrota> {
  const [caminhoes, chamados] = await Promise.all([
    usuario.permissoes.includes('VerFrota') ? caminhoesDaFrota(chamar) : Promise.resolve([]),
    usuario.permissoes.includes('AtenderChamados') ? listarChamados(chamar, CONCLUIDOS_NA_TELA) : Promise.resolve(SEM_CHAMADOS),
  ])
  return { caminhoes, chamados }
}

/** Motorista: os caminhões que estão com ele e os chamados mais novos que ele abriu (pendentes ou concluídos). */
export async function buscarDadosDoMotorista(chamar: Chamar, usuario: Usuario): Promise<DadosDoMotorista> {
  const [caminhoes, abertos] = await Promise.all([
    meusCaminhoes(chamar),
    usuario.permissoes.includes('AbrirChamados') ? listarChamados(chamar, CHAMADOS_DO_MOTORISTA) : null,
  ])
  const chamados = abertos === null ? [] : [...abertos.pendentes, ...abertos.concluidos.itens]
    .sort((a, b) => b.abertoEm.localeCompare(a.abertoEm))
    .slice(0, CHAMADOS_DO_MOTORISTA)
  return { caminhoes, chamados }
}

let pronta: { tela: 'frota'; dados: DadosDaFrota } | { tela: 'motorista'; dados: DadosDoMotorista } | null = null

/**
 * No login e ao abrir o app: busca a tela inicial de quem entrou. Se falhar, não atrapalha: a tela busca quando
 * abrir.
 */
export async function prepararTelaInicial(chamar: Chamar, usuario: Usuario) {
  pronta = null
  try {
    const tela = telaInicialDe(usuario)
    if (tela === 'frota') pronta = { tela, dados: await buscarDadosDaFrota(chamar, usuario) }
    if (tela === 'motorista') pronta = { tela, dados: await buscarDadosDoMotorista(chamar, usuario) }
  } catch {
    // sem os dados agora: a tela inicial mostra o carregando dela e busca de novo
  }
}

/** O que já foi buscado, para a tela abrir com os dados (null: a tela busca sozinha). */
export function telaInicialPronta(tela: 'frota'): DadosDaFrota | null
export function telaInicialPronta(tela: 'motorista'): DadosDoMotorista | null
export function telaInicialPronta(tela: 'frota' | 'motorista') {
  return pronta?.tela === tela ? pronta.dados : null
}

/** A tela inicial abriu: o que foi buscado antes não vale mais (daqui para frente a tela busca sozinha). */
export function esquecerTelaInicial() {
  pronta = null
}
