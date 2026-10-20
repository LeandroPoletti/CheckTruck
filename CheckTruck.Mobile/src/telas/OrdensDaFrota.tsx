import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { Usuario } from '@/servicos/sessao'
import { maisNovaPrimeiro, type OrdemDeServico } from '@/servicos/ordens'
import Botao from '@/componentes/Botao'
import CampoDeBusca from '@/componentes/CampoDeBusca'
import CartaoDaOrdem from '@/componentes/CartaoDaOrdem'
import { cores, fontes } from '@/tema'

// Pela placa (com ou sem hífen) ou pelo número da OS
function combina(os: OrdemDeServico, busca: string) {
  const termo = busca.trim().toLowerCase().replace(/-/g, '')
  if (!termo) return true
  return (os.veiculo?.placa ?? '').toLowerCase().replace(/-/g, '').includes(termo) || String(os.id) === termo
}

// Ordens de serviço da empresa (Ver frota), com Lançar OS para quem tem a permissão Ordem de serviço.
export default function OrdensDaFrota({ ordens, usuario }: { ordens: OrdemDeServico[]; usuario: Usuario }) {
  const [busca, setBusca] = useState('')
  const podeLancar = usuario.permissoes.includes('OrdemServico')
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
            : lista.map((o) => <CartaoDaOrdem key={o.id} os={o} />)}
        </>
      )}
    </>
  )
}

const estilos = StyleSheet.create({
  nenhuma: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 16 },
  cartaoVazio: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 8 },
  vazioTitulo: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto },
  vazioTexto: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.textoFraco },
})
