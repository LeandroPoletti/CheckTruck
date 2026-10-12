import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// O token fica no cofre do celular (Keychain no iPhone, Keystore no Android).
// No navegador (npm run web, só para testar) não existe esse cofre: usa o localStorage.
const CHAVE = 'checktruck.token'

export async function lerToken(): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(CHAVE)
  return SecureStore.getItemAsync(CHAVE)
}

export async function salvarToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (token) localStorage.setItem(CHAVE, token)
    else localStorage.removeItem(CHAVE)
    return
  }

  if (token) await SecureStore.setItemAsync(CHAVE, token)
  else await SecureStore.deleteItemAsync(CHAVE)
}
