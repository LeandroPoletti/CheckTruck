import { useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Redirect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSessao } from '@/servicos/sessao'
import { API_URL } from '@/servicos/api'
import Botao from '@/componentes/Botao'
import Campo from '@/componentes/Campo'
import Carregando from '@/componentes/Carregando'
import { Caminhao } from '@/componentes/Desenhos'
import FaixaDaEstrada from '@/componentes/FaixaDaEstrada'
import { Simbolo } from '@/componentes/Logo'
import MensagemErro from '@/componentes/MensagemErro'
import { amareloDaEstrada, comTema, cores, fontes } from '@/tema'

// Entrar com a mesma conta do web (e-mail e senha cadastrados pelo admin ou pelo gestor)
export default function Login() {
  const { carregando, usuario, entrar } = useSessao()
  const margens = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  // O painel do formulário sobe uma vez ao abrir (sem animação para quem pediu menos movimento no celular)
  const subida = useRef(new Animated.Value(0)).current
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((menosMovimento) =>
      Animated.timing(subida, { toValue: 1, duration: menosMovimento ? 0 : 420, useNativeDriver: true }).start())
  }, [subida])

  if (carregando) return <Carregando />
  if (usuario) return <Redirect href="/" />

  async function aoEntrar() {
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.')
      return
    }
    setEntrando(true)
    setErro('')
    try {
      await entrar(email, senha) // com a sessão, a tela vira o Redirect acima
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.')
      setEntrando(false)
    }
  }

  return (
    <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.rolagem} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={[estilos.marca, { paddingTop: margens.top + 28 }]}>
          <Simbolo tamanho={60} />
          <Text style={estilos.nome}>CheckTruck</Text>
          <FaixaDaEstrada />
          <Text style={estilos.descricao}>Manutenção preventiva da frota, na palma da mão.</Text>

          {/* O caminhão na estrada, de ponta a ponta da tela, logo acima do formulário */}
          <View style={estilos.chao} accessible={false}>
            <View style={estilos.caminhao}><Caminhao largura={250} /></View>
            <View style={estilos.estrada}>
              {Array.from({ length: 8 }, (_, i) => <View key={i} style={estilos.tracoDaEstrada} />)}
            </View>
          </View>
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
  )
}

const estilos = comTema(() => StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.topo },
  rolagem: { flexGrow: 1 },
  marca: { flexGrow: 1, paddingHorizontal: 28, gap: 14 },
  nome: { fontFamily: fontes.titulo, fontSize: 44, lineHeight: 50, color: cores.sobreTopo, letterSpacing: -0.5, marginTop: 4 },
  descricao: { fontFamily: fontes.texto, fontSize: 16, lineHeight: 23, color: cores.sobreTopo2, maxWidth: 290 },
  chao: { marginTop: 'auto', marginHorizontal: -28, paddingTop: 12 },
  caminhao: { alignItems: 'flex-end', paddingRight: 8, marginBottom: -2 },
  estrada: { height: 18, backgroundColor: cores.asfalto, flexDirection: 'row', alignItems: 'center', gap: 24, paddingLeft: 10, overflow: 'hidden', marginBottom: 16 },
  tracoDaEstrada: { width: 34, height: 4, borderRadius: 2, backgroundColor: amareloDaEstrada },
  painel: {
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
