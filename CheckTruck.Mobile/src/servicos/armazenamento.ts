import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// Os tokens do login ficam no cofre do celular (Keychain no iPhone, Keystore no Android).
// No navegador (npm run web, só para testar) não existe esse cofre: usa o localStorage.
const CHAVE = 'checktruck.token'
const CHAVE_DA_RENOVACAO = 'checktruck.renovacao'

/** O accessToken vale 1 hora; o refreshToken (chave de renovação) pede outro sem a senha. */
export type Tokens = { accessToken: string; refreshToken: string }

async function ler(chave: string): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(chave)
  return SecureStore.getItemAsync(chave)
}

async function gravar(chave: string, valor: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (valor) localStorage.setItem(chave, valor)
    else localStorage.removeItem(chave)
    return
  }

  if (valor) await SecureStore.setItemAsync(chave, valor)
  else await SecureStore.deleteItemAsync(chave)
}

/** Login de antes da renovação (só o token guardado) volta sem a chave: quando vencer, entra de novo. */
export async function lerTokens(): Promise<Tokens | null> {
  const [accessToken, refreshToken] = await Promise.all([ler(CHAVE), ler(CHAVE_DA_RENOVACAO)])
  return accessToken ? { accessToken, refreshToken: refreshToken ?? '' } : null
}

export async function salvarTokens(tokens: Tokens | null): Promise<void> {
  await gravar(CHAVE, tokens?.accessToken ?? null)
  await gravar(CHAVE_DA_RENOVACAO, tokens?.refreshToken ?? null)
}
