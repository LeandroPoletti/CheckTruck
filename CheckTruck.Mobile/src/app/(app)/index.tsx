import { useSessao } from '@/servicos/sessao'
import PainelDoMotorista from '@/telas/PainelDoMotorista'
import PainelDaFrota from '@/telas/PainelDaFrota'
import SoPeloSite from '@/telas/SoPeloSite'

// Tela inicial de cada perfil: o motorista vê o caminhão dele; o Autônomo e, na Frota, quem vê a frota ou atende
// chamados veem o painel da frota. Quem não tem nada disso liberado é avisado de que o acesso é pelo site.
export default function Inicio() {
  const { usuario } = useSessao()
  if (!usuario) return null // o _layout já manda quem não entrou para o login

  if (usuario.cargo === 'Motorista') return <PainelDoMotorista usuario={usuario} />

  const cuidaDaFrota = usuario.permissoes.includes('VerFrota') || usuario.permissoes.includes('AtenderChamados')
  const temPainel = usuario.tipoConta === 'Autonomo' || (usuario.tipoConta === 'Frota' && cuidaDaFrota)
  return temPainel ? <PainelDaFrota usuario={usuario} /> : <SoPeloSite usuario={usuario} />
}
