import { StyleSheet, Text } from 'react-native'
import { comTema, cores, fontes } from '@/tema'

// Etiqueta pequena e arredondada com a cor que vier (ex.: De fábrica, Inativo, Do sistema)
export default function Etiqueta({ texto, cor }: { texto: string; cor: { texto: string; fundo: string } }) {
  return <Text style={[estilos.etiqueta, { color: cor.texto, backgroundColor: cor.fundo }]}>{texto}</Text>
}

// O que a empresa cadastrou no catálogo (só ela vê), com a cor do web
export function DaEmpresa() {
  return <Etiqueta texto="Da empresa" cor={{ texto: cores.branco, fundo: cores.marca500 }} />
}

const estilos = comTema(() => StyleSheet.create({
  etiqueta: { fontFamily: fontes.textoForte, fontSize: 11, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
}))
