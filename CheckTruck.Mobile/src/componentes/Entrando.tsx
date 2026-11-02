import { useEffect, useImperativeHandle, useRef, type ComponentRef, type Ref, type RefObject } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
import { comTema, cores } from '@/tema'

// As curvas e os tempos do Material 3: o que chega desacelera no fim (0,3 s); o que sai acelera e é mais curto
// (0,2 s). O fosco só aparece (sem mexer), na curva padrão, que começa e termina suave
const CHEGA = Easing.bezier(0.05, 0.7, 0.1, 1)
const SAI = Easing.bezier(0.3, 0, 0.8, 0.15)
const PADRAO = Easing.bezier(0.2, 0, 0, 1)
const CHEGAR_MS = 300
const SAIR_MS = 200

/** O que o login pede para a tela de carregamento no fim. */
export type FimDoCarregamento = {
  /** Deu certo: o caminhão sai e a tela vira a cor do fundo da tela inicial (a cortina continua daí) */
  entrou(): Promise<void>
  /** Deu errado: tudo some e o login aparece de novo, com o erro */
  errou(): Promise<void>
}

// O fosco aparece e some pela opacidade dele mesmo (num pai com opacidade, o navegador não desenha o fosco)
const FoscoAnimado = Animated.createAnimatedComponent(BlurView)

// Termina quando a animação acaba (ou logo depois do tempo dela, se o celular não avisar): o login nunca fica preso
const animar = (animacao: Animated.CompositeAnimation) => new Promise<void>((pronto) => {
  animacao.start(() => pronto())
  setTimeout(pronto, SAIR_MS + 300)
})
const mudar = (valor: Animated.Value, para: number, duracao: number, curva: (t: number) => number, atraso = 0) =>
  Animated.timing(valor, { toValue: para, duration: duracao, delay: atraso, easing: curva, useNativeDriver: true })

/**
 * A tela de carregamento ao entrar: a tela de login fica fosca e o caminhão com o relógio girando aparece no meio,
 * com um zoom leve. `fundo` é a tela que fica fosca (no Android o fosco é desenhado a partir dela).
 */
export default function Entrando({ fundo, ref }: {
  fundo: RefObject<ComponentRef<typeof View> | null>
  ref: Ref<FimDoCarregamento>
}) {
  const fosco = useRef(new Animated.Value(0)).current
  const caminhao = useRef(new Animated.Value(0)).current // 0 escondido, 1 na tela, 2 saindo
  const veu = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      mudar(fosco, 1, CHEGAR_MS, PADRAO),
      mudar(caminhao, 1, CHEGAR_MS + 50, CHEGA, 50),
    ]).start()
  }, [fosco, caminhao])

  useImperativeHandle(ref, () => ({
    entrou: () => animar(Animated.parallel([mudar(caminhao, 2, SAIR_MS, SAI), mudar(veu, 1, SAIR_MS, SAI)])),
    errou: () => animar(Animated.parallel([mudar(caminhao, 0, SAIR_MS, SAI), mudar(fosco, 0, SAIR_MS, SAI)])),
  }), [fosco, caminhao, veu])

  return (
    <View style={StyleSheet.absoluteFill} accessible accessibilityLabel="Entrando no app">
      <StatusBar style="dark" />
      <FoscoAnimado
        blurTarget={fundo}
        blurMethod="dimezisBlurViewSdk31Plus"
        tint="light"
        intensity={60}
        style={[StyleSheet.absoluteFill, { opacity: fosco }]}
      />
      <Animated.View style={[StyleSheet.absoluteFill, estilos.veu, { opacity: veu }]} />
      <View style={[StyleSheet.absoluteFill, estilos.centro]}>
        <Animated.View
          style={{
            opacity: caminhao.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] }),
            transform: [{ scale: caminhao.interpolate({ inputRange: [0, 1, 2], outputRange: [0.9, 1, 0.96] }) }],
          }}
        >
          <Image source={require('../../assets/caminhao-carregando.webp')} style={estilos.caminhao} contentFit="contain" />
        </Animated.View>
      </View>
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center' },
  caminhao: { width: 240, height: 240 },
  // A cor do fundo da tela inicial, a mesma da cortina
  veu: { backgroundColor: cores.fundo },
}))
