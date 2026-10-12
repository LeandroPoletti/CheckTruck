import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useSessao, type Usuario } from '@/servicos/sessao'
import Botao from '@/componentes/Botao'
import Saudacao from '@/componentes/Saudacao'
import { cores, fontes } from '@/tema'

type Recurso = { icone: keyof typeof Feather.glyphMap; titulo: string; descricao: string }

const DO_AUTONOMO: Recurso[] = [
  { icone: 'truck', titulo: 'Seu caminhão', descricao: 'As próximas trocas, em km e em data' },
  { icone: 'tool', titulo: 'Ordens de serviço', descricao: 'Lançar as trocas feitas na oficina' },
  { icone: 'navigation', titulo: 'Atualizar o km', descricao: 'Sempre que rodar, sem precisar do computador' },
]

// Tela inicial de quem ainda não tem telas no app: o Autônomo vê o que vem por aí; na Frota, quem não tem
// Ver frota nem Atender chamados é avisado de que o acesso dele é pelo site.
export default function InicioProvisorio({ usuario }: { usuario: Usuario }) {
  const { sair } = useSessao()

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <Saudacao usuario={usuario} />

      <ScrollView style={estilos.corpo} contentContainerStyle={estilos.conteudo}>
        {usuario.tipoConta === 'Autonomo' ? <OQueVemPorAi /> : <SoPeloSite />}
        <Botao titulo="Sair" tipo="discreto" icone="log-out" onPress={sair} />
      </ScrollView>
    </SafeAreaView>
  )
}

function OQueVemPorAi() {
  return (
    <>
      <Text style={estilos.secao}>No app você vai poder</Text>
      <View style={estilos.lista}>
        {DO_AUTONOMO.map((r, i) => (
          <View key={r.titulo} style={[estilos.item, i > 0 && estilos.itemComLinha]}>
            <View style={estilos.iconeItem}>
              <Feather name={r.icone} size={20} color={cores.marca700} />
            </View>
            <View style={estilos.textosItem}>
              <Text style={estilos.tituloItem}>{r.titulo}</Text>
              <Text style={estilos.descricaoItem}>{r.descricao}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={estilos.aviso}>
        <Feather name="clock" size={16} color={cores.textoFraco} />
        <Text style={estilos.avisoTexto}>Essas telas chegam nas próximas versões do app.</Text>
      </View>
    </>
  )
}

function SoPeloSite() {
  return (
    <View style={estilos.cartao}>
      <View style={estilos.iconeItem}>
        <Feather name="monitor" size={20} color={cores.marca700} />
      </View>
      <Text style={estilos.secao}>Seu acesso é só pelo site</Text>
      <Text style={estilos.descricaoItem}>
        No app dá para ver a frota e atender chamados. Se você precisa disso, peça ao gestor para liberar em Acesso.
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.marca900 },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  conteudo: { padding: 24, gap: 16 },
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  itemComLinha: { borderTopWidth: 1, borderTopColor: cores.borda },
  iconeItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: cores.marca50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textosItem: { flex: 1, gap: 2 },
  tituloItem: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  descricaoItem: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoFraco },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  avisoTexto: { flex: 1, fontFamily: fontes.texto, fontSize: 13, color: cores.textoFraco },
})
