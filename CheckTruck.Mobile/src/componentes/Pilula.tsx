import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { comTema, cores, fontes } from '@/tema'

// Cara de botão dentro de uma linha tocável (a linha inteira responde ao toque). Ex.: Editar, Definir pro caminhão
export default function Pilula({ icone, titulo }: { icone: keyof typeof Feather.glyphMap; titulo: string }) {
  return (
    <View style={estilos.pilula}>
      <Feather name={icone} size={15} color={cores.marca700} />
      <Text style={estilos.texto}>{titulo}</Text>
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cores.marca300,
    backgroundColor: cores.marca50,
  },
  texto: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.marca700 },
}))
