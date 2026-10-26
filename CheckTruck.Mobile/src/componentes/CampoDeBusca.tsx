import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { comTema, cores, fontes } from '@/tema'

type Props = {
  valor: string
  aoMudar(texto: string): void
  placeholder: string
  /** Maiúscula sozinha (padrão, para placa) ou não ("none", para nomes). */
  autoCapitalize?: TextInputProps['autoCapitalize']
}

// Campo de busca das listas, com a lupa e o X para limpar
export default function CampoDeBusca({ valor, aoMudar, placeholder, autoCapitalize = 'characters' }: Props) {
  return (
    <View style={estilos.busca}>
      <Feather name="search" size={18} color={cores.textoFraco} />
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.textoFraco}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        returnKeyType="search"
        style={estilos.entrada}
      />
      {valor !== '' && (
        <Pressable onPress={() => aoMudar('')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Limpar busca">
          <Feather name="x-circle" size={18} color={cores.textoFraco} />
        </Pressable>
      )}
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  busca: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: cores.branco,
    paddingHorizontal: 14,
  },
  entrada: { flex: 1, minHeight: 48, fontFamily: fontes.texto, fontSize: 15, color: cores.texto },
}))
