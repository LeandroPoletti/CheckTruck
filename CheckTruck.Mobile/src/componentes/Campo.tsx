import { useState, type ReactNode } from 'react'
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { comTema, cores, fontes } from '@/tema'

type Props = TextInputProps & {
  rotulo: string
  /** Algo dentro do campo, à direita (ex.: o olho de mostrar a senha). */
  acessorio?: ReactNode
  /** Texto de várias linhas (ex.: a descrição do chamado), com essa altura inicial. */
  linhas?: number
  /** Explicação curta embaixo do campo. */
  dica?: string
  /** O que está errado neste campo: fica embaixo, em vermelho, no lugar da dica. */
  erro?: string
}

// Campo de texto com o nome em cima. Fica com a borda verde enquanto a pessoa digita nele (vermelha com erro).
export default function Campo({ rotulo, acessorio, linhas, dica, erro, onFocus, onBlur, ...props }: Props) {
  const [focado, setFocado] = useState(false)
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <View style={[estilos.caixa, focado && estilos.caixaFocada, !!erro && estilos.caixaComErro]}>
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
      {erro || dica ? <Text style={[estilos.dica, !!erro && estilos.erro]}>{erro || dica}</Text> : null}
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
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
  caixaComErro: { borderColor: cores.erroTexto },
  dica: { fontFamily: fontes.texto, fontSize: 12, lineHeight: 17, color: cores.textoFraco },
  erro: { color: cores.erroTexto },
  entrada: { flex: 1, minHeight: 48, fontFamily: fontes.texto, fontSize: 16, color: cores.texto },
}))
