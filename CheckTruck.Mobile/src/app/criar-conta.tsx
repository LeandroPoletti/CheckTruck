import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Redirect, router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSessao } from '@/servicos/sessao'
import { criarConta, type NovaConta, type TipoConta } from '@/servicos/empresa'
import { mascaraCpf } from '@/dados/empresa'
import Botao from '@/componentes/Botao'
import Campo from '@/componentes/Campo'
import FaixaDaEstrada from '@/componentes/FaixaDaEstrada'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

type Form = NovaConta & { confirmar: string }
type Erros = Partial<Record<keyof Form, string>>

// A Frota tem equipe; o Autônomo é a própria pessoa (um acesso só, sem chamados e sem motoristas). Textos do web.
const TIPOS: { id: TipoConta; titulo: string; texto: string; icone: keyof typeof Feather.glyphMap }[] = [
  { id: 'Frota', titulo: 'Frota', texto: 'Tenho equipe: gestor, motoristas e mecânicos.', icone: 'users' },
  { id: 'Autonomo', titulo: 'Autônomo', texto: 'Sou eu e meu caminhão: faço tudo sozinho.', icone: 'user' },
]

const VAZIO: Form = { tipoConta: 'Frota', nomeEmpresa: '', cnpj: '', nome: '', cpf: '', email: '', senha: '', confirmar: '' }

// Cliente novo, igual ao Criar conta do web: cria a empresa e o primeiro acesso (Admin) e já entra.
// Aqui só o básico: os dígitos do CNPJ e do CPF, o e-mail repetido e a força da senha a API confere.
export default function CriarConta() {
  const { usuario, entrar } = useSessao()
  const margens = useSafeAreaInsets()
  const [form, setForm] = useState<Form>(VAZIO)
  const [verSenha, setVerSenha] = useState(false)
  const [erros, setErros] = useState<Erros>({})
  const [erroApi, setErroApi] = useState('')
  const [salvando, setSalvando] = useState(false)
  const frota = form.tipoConta === 'Frota'

  if (usuario) return <Redirect href="/" />

  const voltar = () => (router.canGoBack() ? router.back() : router.replace('/login'))

  function mudar(campo: keyof Form, valor: string) {
    setErros((e) => ({ ...e, [campo]: undefined }))
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function validar() {
    const e: Erros = {}
    if (frota && !form.nomeEmpresa.trim()) e.nomeEmpresa = 'Informe o nome da empresa.'
    if (frota && form.cnpj.replace(/[.\-/\s]/g, '').length !== 14) e.cnpj = 'O CNPJ tem 14 caracteres.'
    if (!form.nome.trim()) e.nome = 'Informe o seu nome.'
    if (form.cpf.replace(/\D/g, '').length !== 11) e.cpf = 'O CPF tem 11 números.'
    if (!form.email.trim()) e.email = 'Informe o e-mail.'
    if (!form.senha) e.senha = 'Informe a senha.'
    else if (form.senha !== form.confirmar) e.confirmar = 'As senhas não são iguais.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function aoCriar() {
    setErroApi('')
    if (!validar()) return
    setSalvando(true)
    try {
      await criarConta(form)
      await entrar(form.email, form.senha) // com a sessão, a tela vira o Redirect acima
    } catch (e) {
      setErroApi(e instanceof Error ? e.message : 'Não foi possível criar a conta.')
      setSalvando(false)
    }
  }

  const olho = (
    <Pressable
      onPress={() => setVerSenha((v) => !v)}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={verSenha ? 'Esconder a senha' : 'Mostrar a senha'}
    >
      <Feather name={verSenha ? 'eye-off' : 'eye'} size={20} color={cores.textoFraco} />
    </Pressable>
  )

  return (
    <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.rolagem} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={[estilos.topo, { paddingTop: margens.top + 16 }]}>
          <Pressable onPress={voltar} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar" style={estilos.voltar}>
            <Feather name="arrow-left" size={20} color={cores.marca200} />
          </Pressable>
          <Text style={estilos.titulo}>Criar conta</Text>
          <FaixaDaEstrada />
          <Text style={estilos.descricao}>Escolha como você trabalha. O Autônomo pode virar Frota depois, sem perder nada.</Text>
        </View>

        <View style={[estilos.painel, { paddingBottom: margens.bottom + 24 }]}>
          <View style={estilos.tipos}>
            {TIPOS.map((t) => {
              const escolhido = form.tipoConta === t.id
              return (
                <Pressable
                  key={t.id}
                  onPress={() => mudar('tipoConta', t.id)}
                  style={[estilos.tipo, escolhido && estilos.tipoEscolhido]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: escolhido }}
                >
                  <Feather name={t.icone} size={20} color={cores.marca700} />
                  <Text style={estilos.tipoTitulo}>{t.titulo}</Text>
                  <Text style={estilos.tipoTexto}>{t.texto}</Text>
                </Pressable>
              )
            })}
          </View>

          {frota && (
            <>
              <Campo
                rotulo="Nome da empresa"
                value={form.nomeEmpresa}
                onChangeText={(t) => mudar('nomeEmpresa', t)}
                placeholder="Transportadora Exemplo"
                maxLength={150}
                erro={erros.nomeEmpresa}
              />
              <Campo
                rotulo="CNPJ"
                value={form.cnpj}
                onChangeText={(t) => mudar('cnpj', t.toUpperCase())}
                placeholder="00.000.000/0000-00"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={18}
                erro={erros.cnpj}
              />
            </>
          )}

          <Campo
            rotulo="Seu nome"
            value={form.nome}
            onChangeText={(t) => mudar('nome', t)}
            placeholder="Nome completo"
            autoComplete="name"
            maxLength={150}
            dica={frota ? undefined : 'É o nome da conta no menu.'}
            erro={erros.nome}
          />
          <Campo
            rotulo={frota ? 'Seu CPF' : 'CPF'}
            value={form.cpf}
            onChangeText={(t) => mudar('cpf', mascaraCpf(t))}
            placeholder="000.000.000-00"
            keyboardType="number-pad"
            erro={erros.cpf}
          />
          <Campo
            rotulo="E-mail"
            value={form.email}
            onChangeText={(t) => mudar('email', t)}
            placeholder="voce@empresa.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            dica="É o seu login."
            erro={erros.email}
          />
          <Campo
            rotulo="Senha"
            value={form.senha}
            onChangeText={(t) => mudar('senha', t)}
            placeholder="••••••••"
            secureTextEntry={!verSenha}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            acessorio={olho}
            dica="A senha precisa ter 6 caracteres ou mais, com letra maiúscula, minúscula, número e símbolo (ex.: @)."
            erro={erros.senha}
          />
          <Campo
            rotulo="Confirmar senha"
            value={form.confirmar}
            onChangeText={(t) => mudar('confirmar', t)}
            placeholder="••••••••"
            secureTextEntry={!verSenha}
            autoCapitalize="none"
            textContentType="newPassword"
            erro={erros.confirmar}
          />

          <MensagemErro>{erroApi}</MensagemErro>
          <Botao titulo="Criar conta e entrar" onPress={aoCriar} ocupado={salvando} />
          <Botao titulo="Já tem conta? Entrar" tipo="discreto" onPress={voltar} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.marca900 },
  rolagem: { flexGrow: 1, justifyContent: 'space-between' },
  topo: { paddingHorizontal: 24, paddingBottom: 36, gap: 12 },
  voltar: { alignSelf: 'flex-start', padding: 8, borderRadius: 999, backgroundColor: cores.marca800 },
  titulo: { fontFamily: fontes.titulo, fontSize: 36, lineHeight: 40, color: cores.branco },
  descricao: { fontFamily: fontes.texto, fontSize: 15, lineHeight: 22, color: cores.marca200 },
  painel: {
    backgroundColor: cores.branco,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 18,
  },
  tipos: { flexDirection: 'row', gap: 12 },
  tipo: { flex: 1, gap: 6, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: cores.borda },
  tipoEscolhido: { borderColor: cores.marca500, backgroundColor: cores.marca50 },
  tipoTitulo: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  tipoTexto: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoMedio },
})
