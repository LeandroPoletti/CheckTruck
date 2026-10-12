import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { BarlowSemiCondensed_600SemiBold } from '@expo-google-fonts/barlow-semi-condensed/600SemiBold'
import { BarlowSemiCondensed_700Bold } from '@expo-google-fonts/barlow-semi-condensed/700Bold'
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular'
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium'
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold'
import { SessaoProvider } from '@/servicos/sessao'
import Carregando from '@/componentes/Carregando'
import { cores } from '@/tema'

// Raiz do app: carrega as fontes e a sessão (quem está logado), que valem para todas as telas
export default function Raiz() {
  const [fontesProntas, erroNasFontes] = useFonts({
    BarlowSemiCondensed_600SemiBold,
    BarlowSemiCondensed_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  // Se uma fonte falhar, segue com a do sistema em vez de travar o app
  if (!fontesProntas && !erroNasFontes) return <Carregando />

  return (
    <SessaoProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.marca900 } }} />
    </SessaoProvider>
  )
}
