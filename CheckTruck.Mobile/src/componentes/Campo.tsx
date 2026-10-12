import { useState, type ReactNode } from 'react'
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { cores, fontes } from '@/tema'

type Props = TextInputProps & {
  rotulo: string
  /** Algo dentro do campo, à direita (ex.: o olho de mostrar a senha). */
  acessorio?: ReactNode
  /** Texto de várias linhas (ex.: a descrição do chamado), com essa altura inicial. */
  linhas?: number
}

// Campo de texto com o nome em cima. Fica com a borda verde enquanto a pessoa digita nele.
export default function Campo({ rotulo, acessorio, linhas, onFocus, onBlur, ...props }: Props) {
  const [focado, setFocado] = useState(false)
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={[estilos.caixa, focado && estilos.caixaFocada]}>
        <TextInput
          placeholderTextColor={cores.textoFraco}
          multiline={!!linhas}
          style={[estilos.entrada, linhas ? { minHeight: linhas * 22 + 24, paddingVertical: 12, textAlignVertical: 'top' } : null]}
          onFocus={(e) => { setFocado(true); onFocus?.(e) }}
          onBlur={(e) => { setFocado(false); onBlur?.(e) }}
          {...props}
        />
        {acessorio}
      </View>
    </View>
  )
}

const estilos = StyleSheet.create({
  campo: { gap: 8 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  caixa: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: cores.fundo,
    backgroundColor: cores.fundo,
    paddingHorizontal: 14,
  },
  caixaFocada: { borderColor: cores.marca500, backgroundColor: cores.branco },
  entrada: { flex: 1, minHeight: 48, fontFamily: fontes.texto, fontSize: 16, color: cores.texto },
})
