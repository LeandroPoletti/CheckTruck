import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { CaminhaoNaLista } from '@/servicos/caminhoes'
import { formatKm } from '@/dados/formato'
import Botao from './Botao'
import Placa from './Placa'
import { cores, fontes } from '@/tema'

type Props = {
  caminhao: CaminhaoNaLista
  /** Mostra o botão Atualizar km (o motorista sempre pode no caminhão dele; os outros, com Atualizar km). */
  podeAtualizarKm: boolean
  /** Mostra quem está com o caminhão (para quem vê a frota). */
  mostrarMotorista?: boolean
}

// Cartão branco com a placa, o modelo e o km atual do caminhão
export default function CartaoDoCaminhao({ caminhao, podeAtualizarKm, mostrarMotorista = false }: Props) {
  return (
    <View style={estilos.cartao}>
      <Placa placa={caminhao.placa} />
      <View>
        <Text style={estilos.modelo}>{caminhao.fabricante} {caminhao.modelo.nome}</Text>
        <Text style={estilos.detalhe}>{caminhao.geracao.nome}, {caminhao.potenciaCv} cv</Text>
        {mostrarMotorista && (
          <Text style={estilos.detalhe}>
            {caminhao.motoristaAtual ? `Motorista: ${caminhao.motoristaAtual.nome}` : 'Sem motorista'}
          </Text>
        )}
      </View>
      <View style={estilos.divisoria} />
      <View>
        <Text style={estilos.rotulo}>Km atual</Text>
        <Text style={estilos.km}>{formatKm(caminhao.kmAtual)}</Text>
      </View>
      {podeAtualizarKm && (
        <Botao
          titulo="Atualizar km"
          icone="navigation"
          onPress={() => router.push({
            pathname: '/atualizar-km',
            params: { id: caminhao.id, placa: caminhao.placa, km: caminhao.kmAtual },
          })}
        />
      )}
    </View>
  )
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 14 },
  modelo: { fontFamily: fontes.textoForte, fontSize: 17, color: cores.texto },
  detalhe: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, marginTop: 2 },
  divisoria: { height: 1, backgroundColor: cores.borda },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  km: { fontFamily: fontes.titulo, fontSize: 34, lineHeight: 38, color: cores.texto, marginTop: 2 },
})
