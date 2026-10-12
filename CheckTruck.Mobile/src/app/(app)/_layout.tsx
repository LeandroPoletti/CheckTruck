import { Redirect, Stack } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import Carregando from '@/componentes/Carregando'

// Telas de quem entrou. Sem sessão, vai para o login.
export default function AreaLogada() {
  const { carregando, usuario } = useSessao()
  if (carregando) return <Carregando />
  if (!usuario) return <Redirect href="/login" />
  return <Stack screenOptions={{ headerShown: false }} />
}
