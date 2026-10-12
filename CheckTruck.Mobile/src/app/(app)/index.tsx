import { useSessao } from '@/servicos/sessao'
import PainelDoMotorista from '@/telas/PainelDoMotorista'
import PainelDaFrota from '@/telas/PainelDaFrota'
import InicioProvisorio from '@/telas/InicioProvisorio'

// Tela inicial de cada perfil: o motorista vê o caminhão dele; na Frota, quem vê a frota ou atende chamados
// vê o painel da frota. O Autônomo (e quem não tem nada disso liberado) fica na tela provisória.
export default function Inicio() {
  const { usuario } = useSessao()
  if (!usuario) return null // o _layout já manda quem não entrou para o login

  if (usuario.cargo === 'Motorista') return <PainelDoMotorista usuario={usuario} />

  const cuidaDaFrota = usuario.permissoes.includes('VerFrota') || usuario.permissoes.includes('AtenderChamados')
  if (usuario.tipoConta === 'Frota' && cuidaDaFrota) return <PainelDaFrota usuario={usuario} />

  return <InicioProvisorio usuario={usuario} />
}
