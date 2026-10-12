import { Redirect, Stack } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import Carregando from '@/componentes/Carregando'

// Telas de quem entrou. Sem sessão, vai para o login. Os formulários (km, chamados, OS e o cadastro do caminhão)
// sobem por cima da tela.
export default function AreaLogada() {
  const { carregando, usuario } = useSessao()
  if (carregando) return <Carregando />
  if (!usuario) return <Redirect href="/login" />
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="atualizar-km" options={{ presentation: 'modal' }} />
      <Stack.Screen name="abrir-chamado" options={{ presentation: 'modal' }} />
      <Stack.Screen name="resolver-chamado" options={{ presentation: 'modal' }} />
      <Stack.Screen name="lancar-os" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cadastro-caminhao" options={{ presentation: 'modal' }} />
      <Stack.Screen name="corrigir-km" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
