import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import type { CaminhaoNaLista, ItemDeTroca, Status } from '@/servicos/caminhoes'
import { formatKm, textoDias, textoKmRestante } from '@/dados/formato'
import EtiquetaStatus from '@/componentes/EtiquetaStatus'
import Placa from '@/componentes/Placa'
import { cores, coresDoStatus, fontes } from '@/tema'

type Filtro = 'todos' | Status

const FILTROS: { id: Filtro; nome: string }[] = [
  { id: 'todos', nome: 'Todos' },
  { id: 'critico', nome: coresDoStatus.critico.nome },
  { id: 'atencao', nome: coresDoStatus.atencao.nome },
  { id: 'ok', nome: coresDoStatus.ok.nome },
]

const ORDEM_DO_STATUS: Record<Status, number> = { critico: 0, atencao: 1, ok: 2 }

// O que vence primeiro vem em cima: crítico, atenção e ok; dentro de cada um, o que tem menos km sobrando
function ordenar(caminhoes: CaminhaoNaLista[]) {
  const sobra = (c: CaminhaoNaLista) => c.itemMaisUrgente?.kmRestante ?? Number.MAX_SAFE_INTEGER
  return [...caminhoes].sort((a, b) => ORDEM_DO_STATUS[a.status] - ORDEM_DO_STATUS[b.status] || sobra(a) - sobra(b))
}

// Placa, modelo ou motorista, sem diferença de maiúscula e com ou sem hífen na placa
function combina(caminhao: CaminhaoNaLista, busca: string) {
  const termo = busca.trim().toLowerCase().replace(/-/g, '')
  if (!termo) return true
  return [caminhao.placa, `${caminhao.fabricante} ${caminhao.modelo.nome}`, caminhao.geracao.nome, caminhao.motoristaAtual?.nome ?? '']
    .some((texto) => texto.toLowerCase().replace(/-/g, '').includes(termo))
}

// Quanto falta para a troca, em km e (quando tem) em dias: "Faltam 2.600 km ou 20 dias", "Passou 5.400 km; faltam 20 dias"
function textoDoPrazo({ kmRestante, diasRestantes }: ItemDeTroca) {
  if (diasRestantes === null) return textoKmRestante(kmRestante)
  if (kmRestante > 0 && diasRestantes > 0) {
    return `Faltam ${formatKm(kmRestante)} ou ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`
  }
  return `${textoKmRestante(kmRestante)}; ${textoDias(diasRestantes)}`
}

// Caminhões ativos da empresa, do que vence primeiro para o que vence por último. Toque no caminhão para ver tudo.
export default function CaminhoesDaFrota({ caminhoes }: { caminhoes: CaminhaoNaLista[] }) {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todos')

  if (caminhoes.length === 0) {
    return (
      <View style={estilos.cartaoVazio}>
        <Text style={estilos.vazioTitulo}>Nenhum caminhão ativo</Text>
        <Text style={estilos.vazioTexto}>Os caminhões cadastrados no site aparecem aqui.</Text>
      </View>
    )
  }

  const contagem = (f: Filtro) => (f === 'todos' ? caminhoes.length : caminhoes.filter((c) => c.status === f).length)
  const lista = ordenar(caminhoes).filter((c) => (filtro === 'todos' || c.status === filtro) && combina(c, busca))

  return (
    <>
      <View style={estilos.busca}>
        <Feather name="search" size={18} color={cores.textoFraco} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por placa, modelo ou motorista"
          placeholderTextColor={cores.textoFraco}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          style={estilos.buscaEntrada}
        />
        {busca !== '' && (
          <Pressable onPress={() => setBusca('')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Limpar busca">
            <Feather name="x-circle" size={18} color={cores.textoFraco} />
          </Pressable>
        )}
      </View>

      <View style={estilos.filtros}>
        {FILTROS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFiltro(f.id)}
            style={[estilos.filtro, filtro === f.id && estilos.filtroEscolhido]}
            accessibilityRole="radio"
            accessibilityState={{ selected: filtro === f.id }}
          >
            <Text style={[estilos.filtroTexto, filtro === f.id && estilos.filtroTextoEscolhido]}>
              {f.nome} {contagem(f.id)}
            </Text>
          </Pressable>
        ))}
      </View>

      {lista.length === 0
        ? <Text style={estilos.nenhum}>Nenhum caminhão encontrado.</Text>
        : lista.map((c) => <CartaoNaLista key={c.id} caminhao={c} />)}
    </>
  )
}

function CartaoNaLista({ caminhao }: { caminhao: CaminhaoNaLista }) {
  const item = caminhao.itemMaisUrgente
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/caminhao/[id]', params: { id: caminhao.id } })}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.cartaoApertado]}
      accessibilityRole="button"
      accessibilityLabel={`Caminhão ${caminhao.placa}`}
    >
      <View style={estilos.linha}>
        <Placa placa={caminhao.placa} pequena />
        <EtiquetaStatus status={caminhao.status} />
      </View>
      <View>
        <Text style={estilos.modelo}>{caminhao.fabricante} {caminhao.modelo.nome}, {caminhao.geracao.nome}</Text>
        <Text style={estilos.detalhe}>
          {formatKm(caminhao.kmAtual)} · {caminhao.motoristaAtual ? caminhao.motoristaAtual.nome : 'Sem motorista'}
        </Text>
      </View>
      <View style={estilos.divisoria} />
      <View style={estilos.linha}>
        {item ? (
          <View style={estilos.urgente}>
            <Text style={[estilos.urgenteNome, item.status !== 'ok' && { color: coresDoStatus[item.status].texto }]}>
              {item.tipoManutencaoNome}
            </Text>
            <Text style={estilos.detalhe}>{textoDoPrazo(item)}</Text>
          </View>
        ) : (
          <Text style={[estilos.urgente, estilos.detalhe]}>Nenhuma troca acompanhada</Text>
        )}
        <Feather name="chevron-right" size={20} color={cores.textoFraco} />
      </View>
    </Pressable>
  )
}

const estilos = StyleSheet.create({
  busca: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: cores.branco,
    paddingHorizontal: 14,
  },
  buscaEntrada: { flex: 1, minHeight: 48, fontFamily: fontes.texto, fontSize: 15, color: cores.texto },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filtro: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: cores.branco, borderWidth: 1, borderColor: cores.borda },
  filtroEscolhido: { backgroundColor: cores.marca700, borderColor: cores.marca700 },
  filtroTexto: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.texto },
  filtroTextoEscolhido: { color: cores.branco },
  nenhum: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 16 },
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 16, gap: 10 },
  cartaoApertado: { backgroundColor: cores.marca50 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  modelo: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  detalhe: { fontFamily: fontes.texto, fontSize: 13, color: cores.textoFraco, marginTop: 2 },
  divisoria: { height: 1, backgroundColor: cores.borda },
  urgente: { flex: 1 },
  urgenteNome: { fontFamily: fontes.textoForte, fontSize: 14, color: cores.texto },
  cartaoVazio: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 8 },
  vazioTitulo: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto },
  vazioTexto: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.textoFraco },
})
