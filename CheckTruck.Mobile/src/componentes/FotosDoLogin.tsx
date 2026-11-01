import { useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo, Animated, Easing, StyleSheet, View, type ImageSourcePropType, type LayoutChangeEvent,
} from 'react-native'

type Movimento = 'aproximar' | 'afastar' | 'esquerda' | 'direita'

// As mesmas fotos do login do site, na mesma ordem e com o mesmo andar, já cortadas em pé em volta do caminhão
// (assets/login): as grandes com 1280x1600 e as do WhatsApp sem diminuir
const FOTOS: { fonte: ImageSourcePropType; movimento: Movimento }[] = [
  { fonte: require('../../assets/login/caminhao-01.jpg'), movimento: 'aproximar' },
  { fonte: require('../../assets/login/caminhao-02.jpg'), movimento: 'esquerda' },
  { fonte: require('../../assets/login/caminhao-03.jpg'), movimento: 'afastar' },
  { fonte: require('../../assets/login/caminhao-04.jpg'), movimento: 'direita' },
  { fonte: require('../../assets/login/caminhao-05.jpg'), movimento: 'aproximar' },
  { fonte: require('../../assets/login/caminhao-06.jpg'), movimento: 'afastar' },
  { fonte: require('../../assets/login/caminhao-07.jpg'), movimento: 'esquerda' },
  { fonte: require('../../assets/login/caminhao-08.jpg'), movimento: 'aproximar' },
  { fonte: require('../../assets/login/caminhao-09.jpg'), movimento: 'direita' },
  { fonte: require('../../assets/login/caminhao-10.jpg'), movimento: 'afastar' },
]
const TROCA_MS = 7000
const DISSOLVER_MS = 2000
const ANDAR_MS = TROCA_MS + 2 * DISSOLVER_MS
const AMPLIADA = 1.07 // um pouco ampliada, para o andar para os lados não mostrar a borda
const PASSO_LATERAL = 0.02 // quanto anda para cada lado, em fração da largura

// Onde cada movimento começa e termina: o tamanho e o quanto está deslocada para o lado (fração da largura)
const CAMINHO: Record<Movimento, { escala: [number, number]; lado: [number, number] }> = {
  aproximar: { escala: [1, AMPLIADA], lado: [0, 0] },
  afastar: { escala: [AMPLIADA, 1], lado: [0, 0] },
  esquerda: { escala: [AMPLIADA, AMPLIADA], lado: [PASSO_LATERAL, -PASSO_LATERAL] },
  direita: { escala: [AMPLIADA, AMPLIADA], lado: [-PASSO_LATERAL, PASSO_LATERAL] },
}

type PropsDaFoto = {
  fonte: ImageSourcePropType
  movimento: Movimento
  naVez: boolean
  /** A primeira de todas: já aparece inteira quando a tela abre */
  primeira: boolean
  largura: number
  animar: boolean
}

// Uma foto. Quando chega a vez dela, aparece aos poucos por cima da anterior e começa a andar devagar; continua
// andando enquanto a próxima aparece por cima. A próxima fica escondida, já carregada.
function Foto({ fonte, movimento, naVez, primeira, largura, animar }: PropsDaFoto) {
  const { escala, lado } = CAMINHO[movimento]
  const opacidade = useRef(new Animated.Value(primeira ? 1 : 0)).current
  const andar = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!naVez) return
    if (!animar) {
      opacidade.setValue(1)
      return
    }
    Animated.parallel([
      Animated.timing(opacidade, { toValue: 1, duration: primeira ? 0 : DISSOLVER_MS, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(andar, { toValue: 1, duration: ANDAR_MS, easing: Easing.linear, useNativeDriver: true }),
    ]).start()
  }, [naVez, primeira, animar, opacidade, andar])

  return (
    <Animated.Image
      source={fonte}
      resizeMode="cover"
      style={[
        StyleSheet.absoluteFill,
        estilos.foto,
        {
          opacity: opacidade,
          transform: [
            { translateX: andar.interpolate({ inputRange: [0, 1], outputRange: [lado[0] * largura, lado[1] * largura] }) },
            { scale: andar.interpolate({ inputRange: [0, 1], outputRange: escala }) },
          ],
        },
      ]}
    />
  )
}

/**
 * As fotos de caminhão do topo do login, trocando a cada 7 segundos como no site (efeito Ken Burns): cada foto anda
 * devagar e a próxima aparece aos poucos por cima dela. A tela já abre com a primeira. Quem pediu menos movimento no
 * celular vê só a primeira, parada.
 */
export default function FotosDoLogin() {
  const [menosMovimento, setMenosMovimento] = useState<boolean | null>(null)
  const [passo, setPasso] = useState(0)
  const [largura, setLargura] = useState(0)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setMenosMovimento)
  }, [])

  useEffect(() => {
    if (menosMovimento !== false) return
    const relogio = setInterval(() => setPasso((p) => p + 1), TROCA_MS)
    return () => clearInterval(relogio)
  }, [menosMovimento])

  const medir = (e: LayoutChangeEvent) => setLargura(e.nativeEvent.layout.width)
  return (
    <View style={[estilos.cobrir, estilos.fundo]} onLayout={medir} pointerEvents="none" accessible={false}>
      {menosMovimento !== null && largura > 0 && [passo - 1, passo, passo + 1].filter((n) => n >= 0).map((n) => (
        <Foto
          key={n}
          fonte={FOTOS[n % FOTOS.length].fonte}
          movimento={FOTOS[n % FOTOS.length].movimento}
          naVez={n <= passo}
          primeira={n === 0}
          largura={largura}
          animar={!menosMovimento}
        />
      ))}
      {/* Escurece a foto para a logo e o texto aparecerem bem */}
      <View style={[estilos.cobrir, estilos.escurecer]} />
    </View>
  )
}

const estilos = StyleSheet.create({
  cobrir: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  fundo: { backgroundColor: '#000000' },
  foto: { width: '100%', height: '100%' },
  escurecer: { backgroundColor: 'rgba(0, 0, 0, 0.4)' },
})
