import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { CaminhaoNaLista } from '@/servicos/caminhoes'
import { formatKm } from '@/dados/formato'
import Botao from './Botao'
import Placa from './Placa'
import { comTema, cores, fontes } from '@/tema'

type Props = {
  caminhao: CaminhaoNaLista
  /** Mostra o botão Atualizar km (o motorista sempre pode no caminhão dele; os outros, com Atualizar km). */
  podeAtualizarKm: boolean
  /** Mostra quem está com o caminhão (para quem vê a frota). */
  mostrarMotorista?: boolean
  /** Mostra o atalho Lançar OS, já com este caminhão (permissão Ordem de serviço). */
  podeLancarOS?: boolean
  /**
   * Com isso, aparece o botão Corrigir km embaixo do Atualizar km (só Admin e Gestor). O número é o km da maior OS
   * do caminhão: a correção não pode ficar abaixo dele.
   */
  kmMinimoParaCorrigir?: number
}

// Cartão branco com a placa, o modelo e o km atual do caminhão
export default function CartaoDoCaminhao(
  { caminhao, podeAtualizarKm, mostrarMotorista = false, podeLancarOS = false, kmMinimoParaCorrigir }: Props,
) {
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
      {kmMinimoParaCorrigir !== undefined && (
        <Botao
          titulo="Corrigir km"
          tipo="discreto"
          icone="edit-3"
          onPress={() => router.push({
            pathname: '/corrigir-km',
            params: { id: caminhao.id, placa: caminhao.placa, km: caminhao.kmAtual, minimo: kmMinimoParaCorrigir },
          })}
        />
      )}
      {podeLancarOS && (
        <Botao
          titulo="Lançar OS"
          tipo="discreto"
          icone="tool"
          onPress={() => router.push({ pathname: '/lancar-os', params: { id: caminhao.id } })}
        />
      )}
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 14 },
  modelo: { fontFamily: fontes.textoForte, fontSize: 17, color: cores.texto },
  detalhe: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, marginTop: 2 },
  divisoria: { height: 1, backgroundColor: cores.borda },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  km: { fontFamily: fontes.titulo, fontSize: 34, lineHeight: 38, color: cores.texto, marginTop: 2 },
}))
