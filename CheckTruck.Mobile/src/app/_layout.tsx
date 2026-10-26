import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { BarlowSemiCondensed_700Bold } from '@expo-google-fonts/barlow-semi-condensed/700Bold'
import { Overpass_700Bold } from '@expo-google-fonts/overpass/700Bold'
import { Overpass_800ExtraBold } from '@expo-google-fonts/overpass/800ExtraBold'
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular'
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium'
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold'
import { SessaoProvider, useSessao } from '@/servicos/sessao'
import { prepararAvisos } from '@/servicos/avisos'
import Carregando from '@/componentes/Carregando'
import { aplicarTema, cores } from '@/tema'

prepararAvisos()

// Raiz do app: carrega as fontes e a sessão (quem está logado), que valem para todas as telas
export default function Raiz() {
  const [fontesProntas, erroNasFontes] = useFonts({
    BarlowSemiCondensed_700Bold,
    Overpass_700Bold,
    Overpass_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  // Se uma fonte falhar, segue com a do sistema em vez de travar o app
  if (!fontesProntas && !erroNasFontes) return <Carregando />

  return (
    <SessaoProvider>
      <Navegacao />
    </SessaoProvider>
  )
}

// As telas, na cor do tema de quem está logado. Ao trocar o tema, as telas abrem de novo (a partir da inicial) já
// com as cores novas
function Navegacao() {
  const tema = aplicarTema(useSessao().tema)
  return (
    <>
      <StatusBar style={tema === 'Amarelo' ? 'dark' : 'light'} />
      <Stack key={tema} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.topo } }} />
    </>
  )
}
