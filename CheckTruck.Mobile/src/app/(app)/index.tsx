import { useSessao } from '@/servicos/sessao'
import PainelDoMotorista from '@/telas/PainelDoMotorista'
import InicioProvisorio from '@/telas/InicioProvisorio'

// Tela inicial de cada perfil. O motorista já tem a dele; os outros perfis chegam nas próximas etapas.
export default function Inicio() {
  const { usuario } = useSessao()
  if (!usuario) return null // o _layout já manda quem não entrou para o login

  return usuario.cargo === 'Motorista' ? <PainelDoMotorista usuario={usuario} /> : <InicioProvisorio usuario={usuario} />
}
