import { useCallback, useEffect } from 'react'
import { useFocusEffect } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { atualizarAvisos } from '@/servicos/avisos'
import { primeiraTelaPronta } from '@/componentes/Abertura'
import { descobrirTela } from '@/componentes/Cortina'
import { esquecerTelaInicial, telaInicialDe } from '@/telas/inicio'
import PainelDoMotorista from '@/telas/PainelDoMotorista'
import PainelDaFrota from '@/telas/PainelDaFrota'
import SoPeloSite from '@/telas/SoPeloSite'

// Tela inicial de cada perfil: o motorista vê o caminhão dele, e quem vê a frota ou atende chamados vê o painel da
// frota. Quem não tem nada disso liberado (e o dono do sistema) é avisado de que o acesso é pelo site.
// Toda vez que a tela aparece, os avisos de troca do celular são refeitos com os caminhões de agora.
export default function Inicio() {
  const { chamar, usuario } = useSessao()
  useFocusEffect(useCallback(() => {
    if (usuario) atualizarAvisos(chamar, usuario).catch(() => {}) // sem aviso não atrapalha o uso do app
  }, [chamar, usuario]))

  // A tela já abriu pronta (com o que foi buscado no login ou ao abrir o app): a cortina do login e a abertura do app
  // saem, e o que foi buscado antes não vale mais
  useEffect(() => {
    esquecerTelaInicial()
    descobrirTela()
    primeiraTelaPronta()
  }, [])

  if (!usuario) return null // o _layout já manda quem não entrou para o login

  const tela = telaInicialDe(usuario)
  if (tela === 'motorista') return <PainelDoMotorista usuario={usuario} />
  return tela === 'frota' ? <PainelDaFrota usuario={usuario} /> : <SoPeloSite usuario={usuario} />
}
