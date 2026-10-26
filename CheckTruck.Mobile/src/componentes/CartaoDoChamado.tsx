import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Chamado } from '@/servicos/chamados'
import { formatDataHora } from '@/dados/formato'
import { nomeTipoOcorrencia, nomeUrgencia } from '@/dados/chamados'
import Placa from './Placa'
import { comTema, cores, coresDoStatus, fontes } from '@/tema'

type Props = {
  chamado: Chamado
  /**
   * Para quem atende: mostra a placa, quem abriu, a urgência em destaque e o texto inteiro (pendente ou
   * concluído fica no título da lista). Sem isso é o jeito do motorista, que só vê os chamados dele.
   */
  daFrota?: boolean
  /** Quem está usando o app: no chamado que ele está cuidando aparece "Você está cuidando." */
  euId?: string
  /** Ao tocar na placa (quem vê a frota abre o caminhão). */
  aoTocarNaPlaca?: () => void
  /** Botões embaixo (ex.: Atender e Resolver). */
  children?: ReactNode
}

const COR_DA_URGENCIA = comTema(() => ({
  Baixa: { texto: cores.textoMedio, fundo: cores.fundo },
  Media: coresDoStatus.atencao,
  Alta: coresDoStatus.critico,
}))

export default function CartaoDoChamado({ chamado, daFrota = false, euId, aoTocarNaPlaca, children }: Props) {
  const concluido = chamado.status === 'Concluido'
  if (!daFrota) {
    return (
      <View style={estilos.cartao}>
        <View style={estilos.linha}>
          <Text style={[estilos.tipo, estilos.ocupaALinha]}>{nomeTipoOcorrencia(chamado.tipo)}</Text>
          <Text style={[estilos.etiqueta, concluido ? estilos.concluido : estilos.pendente]}>
            {concluido ? 'Concluído' : 'Pendente'}
          </Text>
        </View>
        <Text style={estilos.meta}>
          Aberto em {formatDataHora(chamado.abertoEm)}, urgência {nomeUrgencia(chamado.urgencia).toLowerCase()}
        </Text>
        <Text style={estilos.descricao} numberOfLines={3}>{chamado.descricao}</Text>
        {!concluido && chamado.atendidoPor && <Text style={estilos.nota}>{chamado.atendidoPor.nome} está cuidando.</Text>}
        {concluido && chamado.solucao && <Text style={estilos.nota}>O que foi feito: {chamado.solucao}</Text>}
      </View>
    )
  }

  const urgencia = COR_DA_URGENCIA[chamado.urgencia]
  const quemCuida = !chamado.atendidoPor
    ? 'Ninguém está cuidando ainda.'
    : chamado.atendidoPor.id === euId ? 'Você está cuidando.' : `${chamado.atendidoPor.nome} está cuidando.`
  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <Pressable onPress={aoTocarNaPlaca} disabled={!aoTocarNaPlaca} accessibilityRole={aoTocarNaPlaca ? 'link' : undefined}>
          <Placa placa={chamado.veiculo.placa} pequena />
        </Pressable>
        <Text style={[estilos.etiqueta, { color: urgencia.texto, backgroundColor: urgencia.fundo }]}>
          {nomeUrgencia(chamado.urgencia)}
        </Text>
      </View>
      <Text style={estilos.tipo}>{nomeTipoOcorrencia(chamado.tipo)}</Text>
      <Text style={estilos.meta}>Aberto por {chamado.abertoPor.nome} em {formatDataHora(chamado.abertoEm)}</Text>
      <Text style={estilos.descricao}>{chamado.descricao}</Text>
      {!concluido && (
        <Text style={[estilos.nota, !chamado.atendidoPor && estilos.notaFraca]}>{quemCuida}</Text>
      )}
      {concluido && chamado.solucao && <Text style={estilos.nota}>O que foi feito: {chamado.solucao}</Text>}
      {concluido && chamado.concluidoEm && (
        <Text style={estilos.meta}>
          Concluído{chamado.atendidoPor ? ` por ${chamado.atendidoPor.nome}` : ''} em {formatDataHora(chamado.concluidoEm)}
        </Text>
      )}
      {children}
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  cartao: { backgroundColor: cores.branco, borderRadius: 16, padding: 16, gap: 6 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  tipo: { fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  ocupaALinha: { flex: 1 },
  etiqueta: { fontFamily: fontes.textoForte, fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  pendente: { color: coresDoStatus.atencao.texto, backgroundColor: coresDoStatus.atencao.fundo },
  concluido: { color: coresDoStatus.ok.texto, backgroundColor: coresDoStatus.ok.fundo },
  meta: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoFraco },
  descricao: { fontFamily: fontes.texto, fontSize: 14, lineHeight: 20, color: cores.texto },
  nota: { fontFamily: fontes.textoMedio, fontSize: 13, lineHeight: 18, color: cores.marca700 },
  notaFraca: { color: cores.textoFraco },
}))
