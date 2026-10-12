import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { tiposDeManutencao, type TipoDeManutencao } from '@/servicos/cadastros'
import { contemBusca } from '@/dados/formato'
import { COMPONENTES } from '@/dados/intervalos'
import Botao from '@/componentes/Botao'
import CampoDeBusca from '@/componentes/CampoDeBusca'
import Etiqueta from '@/componentes/Etiqueta'
import LinhaTocavel from '@/componentes/LinhaTocavel'
import MensagemErro from '@/componentes/MensagemErro'
import Pilula from '@/componentes/Pilula'
import TelaComTopo from '@/componentes/TelaComTopo'
import { cores, fontes } from '@/tema'

const componente = (t: TipoDeManutencao) => COMPONENTES[t.componente] ?? String(t.componente)

// Itens que o sistema acompanha nos caminhões (óleo do motor, filtro de ar...), igual à tela do web (permissão
// Cadastros). Os do sistema a empresa só usa ("Do sistema"); os dela abrem para editar ou excluir.
export default function TiposDeManutencao() {
  const { chamar } = useSessao()
  const [tipos, setTipos] = useState<TipoDeManutencao[] | null>(null)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')

  const carregar = useCallback(async () => {
    try {
      setTipos(await tiposDeManutencao(chamar))
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar.')
    }
  }, [chamar])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  // Do jeito do web: por componente (Motor, Câmbio...) e, dentro dele, pelo nome
  const filtrados = [...(tipos ?? [])]
    .sort((a, b) => a.componente - b.componente || a.nome.localeCompare(b.nome))
    .filter((t) => contemBusca(`${t.nome} ${componente(t)}`, busca))
  const subtitulo = tipos
    ? `${tipos.length} cadastrado${tipos.length === 1 ? '' : 's'} · itens que o sistema acompanha em cada caminhão`
    : undefined

  return (
    <TelaComTopo titulo="Tipos de manutenção" subtitulo={subtitulo}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Botao titulo="Cadastrar tipo" icone="plus" onPress={() => router.push('/tipo-manutencao')} />

        {erro !== '' && (
          <View style={estilos.bloco}>
            <MensagemErro>{erro}</MensagemErro>
            <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
          </View>
        )}
        {tipos === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

        {tipos && (
          <>
            {tipos.length > 0 && (
              <CampoDeBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por nome ou componente" autoCapitalize="none" />
            )}
            {filtrados.length === 0 ? (
              <Text style={estilos.vazio}>{tipos.length > 0 ? 'Nenhum tipo encontrado' : 'Nenhum tipo cadastrado'}</Text>
            ) : (
              <View style={estilos.lista}>
                {filtrados.map((t, i) => (
                  <LinhaTocavel
                    key={t.id}
                    primeira={i === 0}
                    rotulo={t.doSistema ? `${t.nome}: do sistema` : `${t.nome}: Editar`}
                    onPress={t.doSistema ? undefined : () => router.push({ pathname: '/tipo-manutencao', params: { id: t.id } })}
                  >
                    <View style={estilos.topo}>
                      <Text style={estilos.nome}>{t.nome}</Text>
                      {t.doSistema && <Etiqueta texto="Do sistema" cor={{ texto: cores.textoFraco, fundo: cores.fundo }} />}
                    </View>
                    <Text style={estilos.meta}>{[componente(t), t.descricao].filter(Boolean).join(' · ')}</Text>
                    {!t.doSistema && <Pilula icone="edit-2" titulo="Editar" />}
                  </LinhaTocavel>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </TelaComTopo>
  )
}

const estilos = StyleSheet.create({
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 8 },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  nome: { flex: 1, fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  meta: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoMedio },
})
