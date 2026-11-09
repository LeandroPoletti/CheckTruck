import { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, Easing, StyleSheet } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import Logo from './Logo'
import { cores } from '@/tema'

// Iguais à abertura do celular no app.json (backgroundColor e imageWidth): a troca de uma para a outra não aparece
const FUNDO = '#013529'
const LARGURA_DA_LOGO = 176
const SUMIR_MS = 450
// Se o app demorar para ficar pronto (sem internet, servidor lento), a abertura sai mesmo assim e a tela mostra o
// carregando dela
const NO_MAXIMO_MS = 2500

let avisar: (() => void) | null = null

/** A primeira tela (o login ou a inicial, já com os dados) está desenhada: a abertura pode sair. */
export function primeiraTelaPronta() {
  avisar?.()
}

/**
 * A abertura: a mesma tela que o celular mostra ao tocar no ícone (fundo verde-escuro e a logo no meio). Fica por
 * cima de tudo até a primeira tela estar pronta e então some aos poucos, com a logo crescendo de leve, mostrando a
 * tela já carregada. Quem pediu menos movimento vê só sumir.
 */
export default function Abertura() {
  const [naTela, setNaTela] = useState(false)
  const [podeSair, setPodeSair] = useState(false)
  const [visivel, setVisivel] = useState(true)
  const [menosMovimento, setMenosMovimento] = useState(false)
  const saida = useRef(new Animated.Value(0)).current
  const saindo = useRef(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setMenosMovimento)
    avisar = () => setPodeSair(true)
    const limite = setTimeout(() => setPodeSair(true), NO_MAXIMO_MS)
    return () => {
      avisar = null
      clearTimeout(limite)
    }
  }, [])

  useEffect(() => {
    if (saindo.current || !naTela || !podeSair) return
    saindo.current = true
    SplashScreen.hide() // a do celular sai; esta, igual, continua por cima e some aos poucos
    Animated.timing(saida, {
      toValue: 1,
      duration: SUMIR_MS,
      easing: Easing.bezier(0.2, 0, 0, 1), // a curva padrão do Material 3: começa e termina suave
      useNativeDriver: true,
    }).start(() => setVisivel(false))
    setTimeout(() => setVisivel(false), SUMIR_MS + 300) // sai mesmo se o celular não avisar o fim da animação
  }, [naTela, podeSair, saida])

  if (!visivel) return null
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, estilos.abertura, { opacity: saida.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
      onLayout={() => setNaTela(true)}
      pointerEvents={naTela && podeSair ? 'none' : 'auto'} // enquanto some, o toque já vai para a tela de baixo
    >
      <Animated.View
        style={{ transform: [{ scale: saida.interpolate({ inputRange: [0, 1], outputRange: [1, menosMovimento ? 1 : 1.12] }) }] }}
      >
        <Logo largura={LARGURA_DA_LOGO} cor={cores.branco} />
      </Animated.View>
    </Animated.View>
  )
}

const estilos = StyleSheet.create({
  abertura: { backgroundColor: FUNDO, alignItems: 'center', justifyContent: 'center' },
})
