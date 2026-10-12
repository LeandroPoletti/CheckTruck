import { StyleSheet, Text } from 'react-native'
import { coresDoStatus, fontes } from '@/tema'
import type { Status } from '@/servicos/motorista'

// OK, Atenção ou Crítico, com a cor do status
export default function EtiquetaStatus({ status }: { status: Status }) {
  const cor = coresDoStatus[status]
  return <Text style={[estilos.etiqueta, { color: cor.texto, backgroundColor: cor.fundo }]}>{cor.nome}</Text>
}

const estilos = StyleSheet.create({
  etiqueta: {
    fontFamily: fontes.textoForte,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
})
