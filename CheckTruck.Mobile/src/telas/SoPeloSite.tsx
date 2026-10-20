import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useSessao, type Usuario } from '@/servicos/sessao'
import Botao from '@/componentes/Botao'
import Saudacao from '@/componentes/Saudacao'
import { cores, fontes } from '@/tema'

// Tela de quem não tem nada liberado no app (sem Ver frota e sem Atender chamados): o acesso é pelo site.
export default function SoPeloSite({ usuario }: { usuario: Usuario }) {
  const { sair } = useSessao()

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <Saudacao usuario={usuario} />

      <ScrollView style={estilos.corpo} contentContainerStyle={estilos.conteudo}>
        <View style={estilos.cartao}>
          <View style={estilos.icone}>
            <Feather name="monitor" size={20} color={cores.marca700} />
          </View>
          <Text style={estilos.titulo}>Seu acesso é só pelo site</Text>
          <Text style={estilos.texto}>
            No app dá para ver a frota e atender chamados. Se você precisa disso, peça ao gestor para liberar em Acesso.
          </Text>
        </View>
        <Botao titulo="Sair" tipo="discreto" icone="log-out" onPress={sair} />
      </ScrollView>
    </SafeAreaView>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.marca900 },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  conteudo: { padding: 24, gap: 16 },
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 10 },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: cores.marca50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto },
  texto: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoFraco },
})
