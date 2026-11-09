import { useEffect, useRef, useState, type ComponentRef } from 'react'
import {
  AccessibilityInfo, Animated, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Redirect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { BlurTargetView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { Feather } from '@expo/vector-icons'
import { useSessao } from '@/servicos/sessao'
import { API_URL } from '@/servicos/api'
import Botao from '@/componentes/Botao'
import Campo from '@/componentes/Campo'
import { primeiraTelaPronta } from '@/componentes/Abertura'
import Carregando from '@/componentes/Carregando'
import { cobrirTela } from '@/componentes/Cortina'
import Entrando, { type FimDoCarregamento } from '@/componentes/Entrando'
import FaixaDaEstrada from '@/componentes/FaixaDaEstrada'
import FotosDoLogin from '@/componentes/FotosDoLogin'
import Logo from '@/componentes/Logo'
import MensagemErro from '@/componentes/MensagemErro'
import { prepararTelaInicial } from '@/telas/inicio'
import { comTema, cores, fontes } from '@/tema'

// Quanto tempo, no mínimo, o caminhão fica na tela ao entrar. Com a saída dele (0,2 s), a tela inicial começa a
// aparecer com 2,5 s. A espera pelo servidor e a busca da tela inicial contam dentro desse tempo
const ESPERA_MS = 2300

// Vibração curta: de certo ao entrar e de erro com a senha errada (no Android, a do sistema, que segue a configuração
// do celular). Sem vibração no aparelho, segue normal
function vibrar(deuCerto: boolean) {
  const vibracao = Platform.OS === 'android'
    ? Haptics.performAndroidHapticsAsync(deuCerto ? Haptics.AndroidHaptics.Confirm : Haptics.AndroidHaptics.Reject)
    : Haptics.notificationAsync(deuCerto ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error)
  vibracao.catch(() => {})
}

// Entrar com a mesma conta do web (e-mail e senha cadastrados pelo admin ou pelo gestor)
export default function Login() {
  const { carregando, usuario, entrar, chamar } = useSessao()
  const margens = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [menosMovimento, setMenosMovimento] = useState(false)
  const tela = useRef<ComponentRef<typeof View>>(null)
  const carregamento = useRef<FimDoCarregamento>(null)

  // O painel do formulário sobe uma vez ao abrir. Quem pediu menos movimento no celular não vê animação: nem aqui, nem
  // ao entrar (sem o caminhão, vai direto para a tela inicial)
  const subida = useRef(new Animated.Value(0)).current
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((menos) => {
      setMenosMovimento(menos)
      Animated.timing(subida, { toValue: 1, duration: menos ? 0 : 420, useNativeDriver: true }).start()
    })
  }, [subida])

  // Ao abrir o app sem ninguém logado, a abertura sai quando esta tela está pronta
  useEffect(() => {
    if (!carregando && !usuario) primeiraTelaPronta()
  }, [carregando, usuario])

  if (carregando) return <Carregando />
  if (usuario) return <Redirect href="/" />

  async function aoEntrar() {
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.')
      return
    }
    Keyboard.dismiss()
    setEntrando(true)
    setErro('')
    const tempoMinimo = new Promise((pronto) => setTimeout(pronto, menosMovimento ? 0 : ESPERA_MS))
    try {
      // Já com a sessão: espera o tempo do caminhão e a tela inicial ficar pronta; o caminhão sai e a cortina cobre a
      // troca de tela. Daí a tela vira o Redirect acima
      await entrar(email, senha, async (eu) => {
        await Promise.all([tempoMinimo, prepararTelaInicial(chamar, eu)])
        vibrar(true)
        await carregamento.current?.entrou()
        cobrirTela()
      })
    } catch (e) {
      // Senha errada ou sem conexão: o carregamento some e o login volta, com o erro
      vibrar(false)
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.')
      await carregamento.current?.errou()
      setEntrando(false)
    }
  }

  return (
    <View style={estilos.encher}>
      {/* A tela de login: é ela que fica fosca atrás do caminhão quando a pessoa entra */}
      <BlurTargetView ref={tela} style={estilos.encher}>
        <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={estilos.rolagem} keyboardShouldPersistTaps="handled" bounces={false}>
            {/* Em cima, as fotos de caminhão passando, com a marca por cima delas (letra branca em qualquer cor do app) */}
            <View style={[estilos.marca, { paddingTop: margens.top + 28 }]}>
              <StatusBar style="light" />
              <FotosDoLogin />
              {/* Numa View para ficar por cima das fotos também no navegador (lá o desenho sozinho ficaria embaixo) */}
              <View><Logo largura={260} cor={cores.branco} /></View>
              <FaixaDaEstrada />
              <Text style={estilos.descricao}>Manutenção preventiva da frota, na palma da mão.</Text>
            </View>

            <Animated.View
              style={[
                estilos.painel,
                { paddingBottom: margens.bottom + 24 },
                { opacity: subida, transform: [{ translateY: subida.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] },
              ]}
            >
              <View>
                <Text style={estilos.titulo}>Entrar</Text>
                <Text style={estilos.subtitulo}>Use o mesmo e-mail e a mesma senha do sistema web.</Text>
              </View>

              <Campo
                rotulo="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="voce@empresa.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="username"
                returnKeyType="next"
              />
              <Campo
                rotulo="Senha"
                value={senha}
                onChangeText={setSenha}
                placeholder="Sua senha"
                secureTextEntry={!verSenha}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={aoEntrar}
                acessorio={
                  <Pressable
                    onPress={() => setVerSenha((v) => !v)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={verSenha ? 'Esconder a senha' : 'Mostrar a senha'}
                  >
                    <Feather name={verSenha ? 'eye-off' : 'eye'} size={20} color={cores.textoFraco} />
                  </Pressable>
                }
              />

              <MensagemErro>{erro}</MensagemErro>
              <Botao titulo="Entrar" onPress={aoEntrar} ocupado={entrando} />
              <Text style={estilos.semAcesso}>Não tem acesso? Peça ao gestor da sua empresa.</Text>

              {/* Para quem está testando (Expo Go): a qual servidor o app está ligado. No app instalado não aparece */}
              {__DEV__ && (
                <View style={estilos.servidor}>
                  <View style={estilos.pontoServidor} />
                  <Text style={estilos.servidorTexto} numberOfLines={1}>Servidor: {API_URL}</Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BlurTargetView>
      {entrando && !menosMovimento && <Entrando fundo={tela} ref={carregamento} />}
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  encher: { flex: 1 },
  tela: { flex: 1, backgroundColor: cores.topo },
  rolagem: { flexGrow: 1 },
  // A foto vai até embaixo das pontas arredondadas do painel (o painel sobe 28 por cima dela)
  marca: { flexGrow: 1, minHeight: 300, paddingHorizontal: 28, paddingBottom: 56, gap: 14 },
  descricao: { fontFamily: fontes.texto, fontSize: 16, lineHeight: 23, color: 'rgba(255, 255, 255, 0.85)', maxWidth: 290 },
  painel: {
    marginTop: -28,
    backgroundColor: cores.branco,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 18,
  },
  titulo: { fontFamily: fontes.subtitulo, fontSize: 28, color: cores.texto },
  subtitulo: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.textoFraco, marginTop: 2 },
  semAcesso: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.textoFraco, textAlign: 'center' },
  servidor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pontoServidor: { width: 6, height: 6, borderRadius: 3, backgroundColor: cores.marca500 },
  servidorTexto: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoFraco },
}))
