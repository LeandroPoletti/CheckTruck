import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useSessao, type Usuario } from '@/servicos/sessao'
import { atenderChamado, type Chamado } from '@/servicos/chamados'
import Botao from '@/componentes/Botao'
import CartaoDoChamado from '@/componentes/CartaoDoChamado'
import MensagemErro from '@/componentes/MensagemErro'
import { cores, fontes } from '@/tema'

const CONCLUIDOS_NA_TELA = 10

type Props = {
  chamados: Chamado[]
  usuario: Usuario
  /** Recarrega a lista depois de atender. */
  aoMudar(): Promise<void>
}

// Chamados de todos os caminhões, para quem tem Atender chamados: primeiro os pendentes (com Atender e Resolver),
// depois os últimos concluídos. A placa abre o caminhão para quem tem Ver frota.
export default function ChamadosDaFrota({ chamados, usuario, aoMudar }: Props) {
  const { chamar } = useSessao()
  const [atendendoId, setAtendendoId] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const verFrota = usuario.permissoes.includes('VerFrota')
  const pendentes = chamados.filter((c) => c.status === 'Pendente')
  const concluidos = chamados.filter((c) => c.status === 'Concluido').slice(0, CONCLUIDOS_NA_TELA)

  async function atender(chamado: Chamado) {
    setAtendendoId(chamado.id)
    setErro('')
    try {
      await atenderChamado(chamar, chamado.id)
      await aoMudar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível atender o chamado.')
    }
    setAtendendoId(null)
  }

  const abrirCaminhao = (c: Chamado) =>
    verFrota ? () => router.push({ pathname: '/caminhao/[id]', params: { id: c.veiculo.id } }) : undefined

  return (
    <>
      <MensagemErro>{erro}</MensagemErro>

      <Text style={estilos.secao}>Pendentes</Text>
      {pendentes.length === 0 && <Text style={estilos.vazio}>Nenhum chamado pendente.</Text>}
      {pendentes.map((c) => (
        <CartaoDoChamado key={c.id} chamado={c} daFrota euId={usuario.id} aoTocarNaPlaca={abrirCaminhao(c)}>
          <View style={estilos.botoes}>
            {c.atendidoPor?.id !== usuario.id && (
              <View style={estilos.botao}>
                <Botao titulo="Atender" tipo="discreto" ocupado={atendendoId === c.id} onPress={() => atender(c)} />
              </View>
            )}
            <View style={estilos.botao}>
              <Botao
                titulo="Resolver"
                onPress={() => router.push({
                  pathname: '/resolver-chamado',
                  params: { id: c.id, placa: c.veiculo.placa, tipo: c.tipo, descricao: c.descricao },
                })}
              />
            </View>
          </View>
        </CartaoDoChamado>
      ))}

      {concluidos.length > 0 && (
        <>
          <Text style={estilos.secao}>Concluídos</Text>
          {concluidos.map((c) => (
            <CartaoDoChamado key={c.id} chamado={c} daFrota euId={usuario.id} aoTocarNaPlaca={abrirCaminhao(c)} />
          ))}
        </>
      )}
    </>
  )
}

const estilos = StyleSheet.create({
  secao: { fontFamily: fontes.subtitulo, fontSize: 22, color: cores.texto, marginTop: 6 },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 8 },
  botoes: { flexDirection: 'row', gap: 10, marginTop: 8 },
  botao: { flex: 1 },
})
