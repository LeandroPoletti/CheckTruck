import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { BarlowSemiCondensed_700Bold } from '@expo-google-fonts/barlow-semi-condensed/700Bold'
import { Overpass_700Bold } from '@expo-google-fonts/overpass/700Bold'
import { Overpass_800ExtraBold } from '@expo-google-fonts/overpass/800ExtraBold'
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular'
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium'
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold'
import { SessaoProvider, useSessao } from '@/servicos/sessao'
import { prepararAvisos } from '@/servicos/avisos'
import Abertura from '@/componentes/Abertura'
import Carregando from '@/componentes/Carregando'
import Cortina from '@/componentes/Cortina'
import { prepararTelaInicial } from '@/telas/inicio'
import { aplicarTema, cores } from '@/tema'

prepararAvisos()
// A abertura do celular (a logo no app.json) fica na tela até o app estar pronto: quem a tira é a Abertura
SplashScreen.preventAutoHideAsync()

// Raiz do app: carrega as fontes e a sessão (quem está logado), que valem para todas as telas. A abertura fica por
// cima de tudo até a primeira tela estar pronta
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
  return (
    <>
      {fontesProntas || erroNasFontes ? (
        <SessaoProvider aoAbrir={prepararTelaInicial}>
          <Navegacao />
        </SessaoProvider>
      ) : <Carregando />}
      <Abertura />
    </>
  )
}

// As telas, na cor do tema de quem está logado. Ao trocar o tema, as telas abrem de novo (a partir da inicial) já
// com as cores novas. Do login para a tela inicial a troca é direta: quem faz a passagem é a cortina, por cima.
function Navegacao() {
  const tema = aplicarTema(useSessao().tema)
  return (
    <>
      <StatusBar style={tema === 'Amarelo' ? 'dark' : 'light'} />
      <Stack key={tema} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.topo } }}>
        <Stack.Screen name="(app)" options={{ animation: 'none' }} />
      </Stack>
      <Cortina />
    </>
  )
}
