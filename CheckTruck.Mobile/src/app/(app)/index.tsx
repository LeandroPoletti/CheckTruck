import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useSessao, type Usuario } from '@/servicos/sessao'
import { nomeCargo } from '@/dados/cargos'
import Botao from '@/componentes/Botao'
import FaixaDaEstrada from '@/componentes/FaixaDaEstrada'
import { cores, fontes } from '@/tema'

type Recurso = { icone: keyof typeof Feather.glyphMap; titulo: string; descricao: string }

// Tela inicial. Mostra o que cada perfil vai fazer no app; as telas chegam nas próximas etapas.
export default function Inicio() {
  const { usuario, sair } = useSessao()
  if (!usuario) return null // o _layout já manda quem não entrou para o login

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.ola}>Olá, {usuario.nome.split(' ')[0]}</Text>
        <View style={estilos.quem}>
          <Text style={estilos.cargo}>{nomeCargo(usuario.cargo)}</Text>
          {usuario.empresa && <Text style={estilos.empresa} numberOfLines={1}>{usuario.empresa}</Text>}
        </View>
        <FaixaDaEstrada />
      </View>

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
  if (usuario.cargo === 'Motorista') {
    return [
      { icone: 'truck', titulo: 'Seu caminhão', descricao: 'As próximas trocas, em km e em data' },
      { icone: 'navigation', titulo: 'Atualizar o km', descricao: 'Sempre que rodar, sem precisar do computador' },
      { icone: 'message-square', titulo: 'Abrir chamado', descricao: 'Contar um problema e a oficina fica sabendo' },
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
  cabecalho: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, gap: 12 },
  ola: { fontFamily: fontes.titulo, fontSize: 36, lineHeight: 40, color: cores.branco },
  quem: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  cargo: {
    fontFamily: fontes.textoForte,
    fontSize: 12,
    color: cores.marca100,
    backgroundColor: cores.marca700,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  empresa: { flexShrink: 1, fontFamily: fontes.texto, fontSize: 14, color: cores.marca200 },
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
