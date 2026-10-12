import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useSessao, type Usuario } from '@/servicos/sessao'
import Botao from '@/componentes/Botao'
import Saudacao from '@/componentes/Saudacao'
import { cores, fontes } from '@/tema'

type Recurso = { icone: keyof typeof Feather.glyphMap; titulo: string; descricao: string }

// Tela inicial de quem ainda não tem as telas no app (mecânico, autônomo, gestão): mostra o que vem por aí.
export default function InicioProvisorio({ usuario }: { usuario: Usuario }) {
  const { sair } = useSessao()

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <Saudacao usuario={usuario} />

      <ScrollView style={estilos.corpo} contentContainerStyle={estilos.conteudo}>
        <Text style={estilos.secao}>No app você vai poder</Text>
        <View style={estilos.lista}>
          {recursos(usuario).map((r, i) => (
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

        <Botao titulo="Sair" tipo="discreto" icone="log-out" onPress={sair} />
      </ScrollView>
    </SafeAreaView>
  )
}

function recursos(usuario: Usuario): Recurso[] {
  if (usuario.tipoConta === 'Autonomo') {
    return [
      { icone: 'truck', titulo: 'Seu caminhão', descricao: 'As próximas trocas, em km e em data' },
      { icone: 'tool', titulo: 'Ordens de serviço', descricao: 'Lançar as trocas feitas na oficina' },
      { icone: 'navigation', titulo: 'Atualizar o km', descricao: 'Sempre que rodar, sem precisar do computador' },
    ]
  }
  if (usuario.cargo === 'Mecanico') {
    return [
      { icone: 'truck', titulo: 'Situação dos caminhões', descricao: 'O que vence primeiro em cada um' },
      { icone: 'message-square', titulo: 'Chamados', descricao: 'Ver, atender e resolver' },
      { icone: 'navigation', titulo: 'Atualizar o km', descricao: 'Direto do pátio' },
    ]
  }
  return [
    { icone: 'truck', titulo: 'Situação da frota', descricao: 'O que vence primeiro em cada caminhão' },
    { icone: 'message-square', titulo: 'Chamados', descricao: 'Acompanhar o que os motoristas abriram' },
    { icone: 'navigation', titulo: 'Atualizar o km', descricao: 'De qualquer lugar' },
  ]
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.marca900 },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20 },
  conteudo: { padding: 24, gap: 16 },
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
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
