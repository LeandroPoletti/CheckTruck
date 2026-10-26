import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { comTema, coresDoStatus, fontes } from '@/tema'
import type { Status } from '@/servicos/caminhoes'

// OK (com o visto), Atenção ou Crítico (com o triângulo), na cor do status, igual ao site
export default function EtiquetaStatus({ status }: { status: Status }) {
  const cor = coresDoStatus[status]
  return (
    <View style={[estilos.etiqueta, { backgroundColor: cor.fundo }]}>
      <Feather name={status === 'ok' ? 'check-circle' : 'alert-triangle'} size={13} color={cor.texto} />
      <Text style={[estilos.texto, { color: cor.texto }]}>{cor.nome}</Text>
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  etiqueta: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 10, paddingVertical: 3, borderRadius: 999 },
  texto: { fontFamily: fontes.textoForte, fontSize: 13 },
}))
