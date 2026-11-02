import { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, Easing, StyleSheet } from 'react-native'
import { comTema, cores } from '@/tema'

const SUMIR_MS = 300
// Se a tela inicial não avisar que abriu, a cortina sai sozinha: o app nunca fica coberto
const NO_MAXIMO_MS = 1500

let avisar: ((cobrir: boolean) => void) | null = null

/** No fim do carregamento do login: cobre a tela com a cor do fundo, para a troca para a tela inicial não piscar. */
export function cobrirTela() {
  avisar?.(true)
}

/** A tela inicial já está pronta embaixo: a cortina some devagar. */
export function descobrirTela() {
  avisar?.(false)
}

/**
 * A cortina, por cima de todas as telas: só aparece na passagem do login para a tela inicial (a tela de carregamento
 * vira a cor do fundo, e a tela inicial aparece aos poucos, já pronta). Quem pediu menos movimento vê a troca direta.
 */
export default function Cortina() {
  const [coberta, setCoberta] = useState(false)
  const opacidade = useRef(new Animated.Value(1)).current

  useEffect(() => {
    let cobrindo = false
    let limite: ReturnType<typeof setTimeout> | undefined

    // Some aos poucos e sai da tela no fim (ou logo depois do tempo da animação, se o celular não avisar)
    const sumir = async () => {
      if (!cobrindo) return
      cobrindo = false
      clearTimeout(limite)
      const menosMovimento = await AccessibilityInfo.isReduceMotionEnabled()
      const duracao = menosMovimento ? 0 : SUMIR_MS
      Animated.timing(opacidade, {
        toValue: 0,
        duration: duracao,
        easing: Easing.bezier(0.2, 0, 0, 1), // a curva padrão do Material 3: começa e termina suave
        useNativeDriver: true,
      }).start(() => setCoberta(false))
      limite = setTimeout(() => setCoberta(false), duracao + 300)
    }

    avisar = (cobrir) => {
      if (!cobrir) {
        sumir()
        return
      }
      cobrindo = true
      opacidade.stopAnimation()
      opacidade.setValue(1)
      setCoberta(true)
      clearTimeout(limite)
      limite = setTimeout(sumir, NO_MAXIMO_MS)
    }
    return () => {
      avisar = null
      clearTimeout(limite)
    }
  }, [opacidade])

  if (!coberta) return null
  return <Animated.View style={[StyleSheet.absoluteFill, estilos.cortina, { opacity: opacidade }]} pointerEvents="none" />
}

const estilos = comTema(() => StyleSheet.create({
  cortina: { backgroundColor: cores.fundo },
}))
