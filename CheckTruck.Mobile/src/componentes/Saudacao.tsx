import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { Usuario } from '@/servicos/sessao'
import { nomeCargo } from '@/dados/cargos'
import FaixaDaEstrada from './FaixaDaEstrada'
import Logo from './Logo'
import { cores, fontes } from '@/tema'

// Topo verde das telas de quem entrou: a logo, o nome, o cargo, a empresa e a faixa da estrada.
// Com aoSair, mostra o botão de sair no canto.
export default function Saudacao({ usuario, aoSair }: { usuario: Usuario; aoSair?: () => void }) {
  return (
    <View style={estilos.cabecalho}>
      <View style={estilos.linha}>
        <Logo />
        {aoSair && (
          <Pressable onPress={aoSair} hitSlop={12} accessibilityRole="button" accessibilityLabel="Sair" style={estilos.sair}>
            <Feather name="log-out" size={20} color={cores.marca200} />
          </Pressable>
        )}
      </View>
      <Text style={estilos.ola}>Olá, {usuario.nome.split(' ')[0]}</Text>
      <View style={estilos.quem}>
        <Text style={estilos.cargo}>{nomeCargo(usuario.cargo)}</Text>
        {usuario.empresa && <Text style={estilos.empresa} numberOfLines={1}>{usuario.empresa}</Text>}
      </View>
      <FaixaDaEstrada />
    </View>
  )
}

const estilos = StyleSheet.create({
  cabecalho: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, gap: 12 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  ola: { fontFamily: fontes.titulo, fontSize: 36, lineHeight: 42, color: cores.branco, marginTop: 4 },
  sair: { padding: 10, borderRadius: 12, backgroundColor: cores.marca800 },
  quem: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  cargo: {
    fontFamily: fontes.textoForte,
    fontSize: 13,
    color: cores.marca100,
    backgroundColor: cores.marca700,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  empresa: { flexShrink: 1, fontFamily: fontes.texto, fontSize: 14, color: cores.marca200 },
})
