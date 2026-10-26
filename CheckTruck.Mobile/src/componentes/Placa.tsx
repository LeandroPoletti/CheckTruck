import { StyleSheet, Text, View } from 'react-native'
import { comTema, cores, fontes } from '@/tema'

// A placa do caminhão no desenho da placa Mercosul: faixa azul com "BRASIL" em cima e as letras pretas
export default function Placa({ placa, pequena = false }: { placa: string; pequena?: boolean }) {
  return (
    <View style={[estilos.placa, pequena && estilos.placaPequena]} accessibilityLabel={`Placa ${placa}`}>
      <View style={[estilos.faixa, pequena && estilos.faixaPequena]}>
        <Text style={[estilos.brasil, pequena && estilos.brasilPequeno]}>BRASIL</Text>
      </View>
      <Text style={[estilos.letras, pequena && estilos.letrasPequenas]}>{placa}</Text>
    </View>
  )
}

const AZUL_MERCOSUL = '#1f3a93'

const estilos = comTema(() => StyleSheet.create({
  placa: {
    alignSelf: 'flex-start',
    minWidth: 170,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: cores.texto,
    backgroundColor: cores.branco,
    overflow: 'hidden',
    alignItems: 'center',
  },
  placaPequena: { minWidth: 108, borderRadius: 6, borderWidth: 1.5 },
  faixa: { alignSelf: 'stretch', backgroundColor: AZUL_MERCOSUL, alignItems: 'center', paddingVertical: 2 },
  faixaPequena: { paddingVertical: 1 },
  brasil: { color: cores.branco, fontFamily: fontes.textoForte, fontSize: 9, letterSpacing: 2 },
  brasilPequeno: { fontSize: 6, letterSpacing: 1.5 },
  letras: { fontFamily: fontes.placa, fontSize: 34, lineHeight: 40, color: cores.texto, paddingHorizontal: 14, letterSpacing: 1 },
  letrasPequenas: { fontSize: 20, lineHeight: 24, paddingHorizontal: 8 },
}))
