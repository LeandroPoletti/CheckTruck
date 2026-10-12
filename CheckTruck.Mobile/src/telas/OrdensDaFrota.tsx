import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { Usuario } from '@/servicos/sessao'
import type { OrdemDeServico } from '@/servicos/ordens'
import { formatData, formatDataHora, formatKm } from '@/dados/formato'
import Botao from '@/componentes/Botao'
import CampoDeBusca from '@/componentes/CampoDeBusca'
import Placa from '@/componentes/Placa'
import { cores, coresDoStatus, fontes } from '@/tema'

// Da mais nova para a mais velha (pela data da troca; no mesmo dia, a de número maior)
const maisNovaPrimeiro = (a: OrdemDeServico, b: OrdemDeServico) => b.realizadoEm.localeCompare(a.realizadoEm) || b.id - a.id

// Pela placa (com ou sem hífen) ou pelo número da OS
function combina(os: OrdemDeServico, busca: string) {
  const termo = busca.trim().toLowerCase().replace(/-/g, '')
  if (!termo) return true
  return (os.veiculo?.placa ?? '').toLowerCase().replace(/-/g, '').includes(termo) || String(os.id) === termo
}

// Ordens de serviço da empresa (Ver frota), com Lançar OS para quem tem a permissão Ordem de serviço.
// Na Frota o cartão mostra o motorista que estava com o caminhão; o Autônomo não tem motorista.
export default function OrdensDaFrota({ ordens, usuario }: { ordens: OrdemDeServico[]; usuario: Usuario }) {
  const [busca, setBusca] = useState('')
  const podeLancar = usuario.permissoes.includes('OrdemServico')
  const frota = usuario.tipoConta === 'Frota'
  const lista = [...ordens].sort(maisNovaPrimeiro).filter((o) => combina(o, busca))

  return (
    <>
      {podeLancar && <Botao titulo="Lançar OS" icone="plus" onPress={() => router.push('/lancar-os')} />}

      {ordens.length === 0 ? (
        <View style={estilos.cartaoVazio}>
          <Text style={estilos.vazioTitulo}>Nenhuma OS lançada</Text>
          <Text style={estilos.vazioTexto}>
            {podeLancar ? 'Use "Lançar OS" para registrar uma troca feita no caminhão.' : 'As trocas lançadas no site aparecem aqui.'}
          </Text>
        </View>
      ) : (
        <>
          <CampoDeBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por placa ou nº da OS" />
          {lista.length === 0
            ? <Text style={estilos.nenhuma}>Nenhuma OS encontrada.</Text>
            : lista.map((o) => <CartaoDaOrdem key={o.id} os={o} mostrarMotorista={frota} />)}
        </>
      )}
    </>
  )
}

function CartaoDaOrdem({ os, mostrarMotorista }: { os: OrdemDeServico; mostrarMotorista: boolean }) {
  const veiculo = os.veiculo
  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <View>
          <Text style={estilos.numero}>OS nº {os.id}</Text>
          <Text style={estilos.meta}>{formatData(os.realizadoEm)} · {formatKm(os.kmAtual)}</Text>
        </View>
        {veiculo && (
          <Pressable
            onPress={() => router.push({ pathname: '/caminhao/[id]', params: { id: veiculo.id } })}
            accessibilityRole="link"
          >
            <Placa placa={veiculo.placa} pequena />
          </Pressable>
        )}
      </View>

      <View style={estilos.divisoria} />
      {os.itens.map((i) => (
        <View key={i.id} style={estilos.linha}>
          <View style={estilos.itemNome}>
            <Text style={estilos.item}>{i.tipoManutencao?.nome}</Text>
            {i.isPrimeiraTroca && <Text style={estilos.selo}>1ª troca</Text>}
          </View>
          <Text style={estilos.meta}>próx. {formatKm(i.kmProximaTroca)}</Text>
        </View>
      ))}
      <View style={estilos.divisoria} />

      <Text style={estilos.detalhe}>Feita por {os.mecanicos.map((m) => `${m.nome} (${m.funcao})`).join(', ')}</Text>
      {os.concessionaria && <Text style={estilos.detalhe}>Concessionária / oficina: {os.concessionaria}</Text>}
      {mostrarMotorista && <Text style={estilos.detalhe}>Motorista: {os.motorista?.nome ?? 'Sem motorista'}</Text>}
      {os.observacao && <Text style={estilos.detalhe}>Observações: {os.observacao}</Text>}
      <Text style={estilos.meta}>
        Lançada{os.lancadoPor ? ` por ${os.lancadoPor.nome}` : ''} em {formatDataHora(os.lancadoEm)}
      </Text>
    </View>
  )
}

const estilos = StyleSheet.create({
  nenhuma: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 16 },
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 16, gap: 8 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  numero: { fontFamily: fontes.subtitulo, fontSize: 20, color: cores.texto },
  meta: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoFraco },
  divisoria: { height: 1, backgroundColor: cores.borda },
  itemNome: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  item: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  selo: {
    fontFamily: fontes.textoForte,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
    color: coresDoStatus.atencao.texto,
    backgroundColor: coresDoStatus.atencao.fundo,
  },
  detalhe: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoMedio },
  cartaoVazio: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 8 },
  vazioTitulo: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto },
  vazioTexto: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.textoFraco },
})
