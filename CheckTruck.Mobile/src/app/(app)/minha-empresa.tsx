import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useFocusEffect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSessao } from '@/servicos/sessao'
import { minhaEmpresa, virarFrota, type Empresa } from '@/servicos/empresa'
import { TIPOS_CONTA, formatarDocumento } from '@/dados/empresa'
import Botao from '@/componentes/Botao'
import FaixaDaEstrada from '@/componentes/FaixaDaEstrada'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

// Dados da conta, igual ao Minha empresa do web (só Admin e Gestor chegam aqui). No Autônomo, o Virar Frota:
// depois de virar, a sessão é lida de novo e o app passa a ser o da Frota (com os chamados).
export default function MinhaEmpresa() {
  const { chamar, recarregar } = useSessao()
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [erro, setErro] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [mudando, setMudando] = useState(false)
  const [virou, setVirou] = useState(false)

  const carregar = useCallback(async () => {
    try {
      setEmpresa(await minhaEmpresa(chamar))
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar a empresa.')
    }
  }, [chamar])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  async function aoVirarFrota() {
    setMudando(true)
    setErro('')
    try {
      setEmpresa(await virarFrota(chamar))
      await recarregar()
      setVirou(true)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível virar Frota.')
    }
    setMudando(false)
    setConfirmando(false)
  }

  const autonomo = empresa?.tipoConta === 'Autonomo'
  // O documento é o da criação da conta: quem virou Frota continua com o CPF
  const nomeDoDocumento = (empresa?.documento?.length ?? (autonomo ? 11 : 14)) === 14 ? 'CNPJ' : 'CPF'

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <View style={estilos.cabecalho}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar" style={estilos.voltar}>
          <Feather name="arrow-left" size={20} color={cores.marca200} />
        </Pressable>
        <Text style={estilos.titulo}>Minha empresa</Text>
        <FaixaDaEstrada />
        <Text style={estilos.subtitulo}>Dados da conta no CheckTruck</Text>
      </View>

      <View style={estilos.corpo}>
        <ScrollView contentContainerStyle={estilos.conteudo}>
          <MensagemErro>{erro}</MensagemErro>
          {empresa === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

          {empresa && (
            <>
              <View style={estilos.cartao}>
                <Dado rotulo="Nome" valor={empresa.nome} />
                <Dado rotulo="Tipo de conta" valor={TIPOS_CONTA[empresa.tipoConta]} />
                <Dado rotulo={nomeDoDocumento} valor={empresa.documento ? formatarDocumento(empresa.documento) : '—'} />
              </View>

              {virou && (
                <View style={estilos.pronto}>
                  <Feather name="check-circle" size={20} color={cores.marca700} />
                  <Text style={estilos.prontoTexto}>
                    Pronto: sua conta agora é Frota. Cadastre os acessos (motoristas, mecânicos, gestor) pelo site, em Acesso.
                  </Text>
                </View>
              )}

              {autonomo && (
                <View style={estilos.cartao}>
                  <Text style={estilos.cartaoTitulo}>Virar Frota</Text>
                  <Text style={estilos.texto}>
                    Contratou motorista ou vai ter equipe? Na Frota você cadastra acessos (motoristas, mecânicos, gestor), cada
                    um com o que pode fazer, e os motoristas abrem chamados. Seus caminhões, OS e intervalos continuam iguais.
                    Não dá para voltar a Autônomo.
                  </Text>
                  {confirmando ? (
                    <>
                      <Botao titulo="Sim, virar Frota" onPress={aoVirarFrota} ocupado={mudando} />
                      <Botao titulo="Cancelar" tipo="discreto" onPress={() => setConfirmando(false)} />
                    </>
                  ) : (
                    <Botao titulo="Virar Frota" icone="users" onPress={() => setConfirmando(true)} />
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.dado}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.marca900 },
  cabecalho: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, gap: 12 },
  voltar: { alignSelf: 'flex-start', padding: 8, borderRadius: 999, backgroundColor: cores.marca800 },
  titulo: { fontFamily: fontes.titulo, fontSize: 32, lineHeight: 36, color: cores.branco },
  subtitulo: { fontFamily: fontes.texto, fontSize: 14, color: cores.marca200 },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, overflow: 'hidden' },
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  carregando: { marginTop: 40 },
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 14 },
  cartaoTitulo: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto },
  texto: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 21, color: cores.textoMedio },
  dado: { gap: 2 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  valor: { fontFamily: fontes.textoForte, fontSize: 17, color: cores.texto },
  pronto: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: cores.marca50, borderRadius: 16, padding: 16 },
  prontoTexto: { flex: 1, fontFamily: fontes.textoMedio, fontSize: 14, lineHeight: 20, color: cores.marca700 },
})
