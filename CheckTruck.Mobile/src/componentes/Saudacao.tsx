import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import type { Usuario } from '@/servicos/sessao'
import { nomeCargo } from '@/dados/cargos'
import FaixaDaEstrada from './FaixaDaEstrada'
import { cores, fontes } from '@/tema'

// Topo verde das telas de quem entrou: o nome, o cargo, a empresa e a faixa da estrada.
// Com aoSair, mostra o botão de sair no canto.
export default function Saudacao({ usuario, aoSair }: { usuario: Usuario; aoSair?: () => void }) {
  return (
    <View style={estilos.cabecalho}>
      <View style={estilos.linha}>
        <Text style={estilos.ola}>Olá, {usuario.nome.split(' ')[0]}</Text>
        {aoSair && (
          <Pressable onPress={aoSair} hitSlop={12} accessibilityRole="button" accessibilityLabel="Sair" style={estilos.sair}>
            <Feather name="log-out" size={20} color={cores.marca200} />
          </Pressable>
        )}
      </View>
      <View style={estilos.quem}>
        <Text style={estilos.cargo}>{nomeCargo(usuario.cargo)}</Text>
        {usuario.empresa && <Text style={estilos.empresa} numberOfLines={1}>{usuario.empresa}</Text>}
      </View>
      <FaixaDaEstrada />
    </View>
  )
}

const estilos = StyleSheet.create({
  cabecalho: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, gap: 12 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ola: { fontFamily: fontes.titulo, fontSize: 36, lineHeight: 40, color: cores.branco },
  sair: { padding: 8, borderRadius: 999, backgroundColor: cores.marca800 },
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
})
