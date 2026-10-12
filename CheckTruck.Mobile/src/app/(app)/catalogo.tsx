import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { fabricantes as listarFabricantes, modelos as listarModelos, type Fabricante, type Modelo } from '@/servicos/cadastros'
import { contemBusca, quantos } from '@/dados/formato'
import Botao from '@/componentes/Botao'
import CampoDeBusca from '@/componentes/CampoDeBusca'
import LinhaDoCatalogo from '@/componentes/LinhaDoCatalogo'
import MensagemErro from '@/componentes/MensagemErro'
import TelaComTopo from '@/componentes/TelaComTopo'
import { cores, fontes } from '@/tema'

type Dados = { fabricantes: Fabricante[]; modelos: Modelo[] }

// Catálogo, igual ao web (permissão Cadastros): fabricante → modelo → geração → potência, usados no cadastro do
// caminhão. Aqui os fabricantes; tocar num abre os modelos dele. Recarrega ao voltar para a tela.
export default function Catalogo() {
  const { chamar } = useSessao()
  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')

  const carregar = useCallback(async () => {
    try {
      const [fabricantes, modelos] = await Promise.all([listarFabricantes(chamar), listarModelos(chamar)])
      setDados({ fabricantes: [...fabricantes].sort((a, b) => a.nome.localeCompare(b.nome)), modelos })
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar o catálogo.')
    }
  }, [chamar])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  const filtrados = dados?.fabricantes.filter((f) => contemBusca(`${f.nome} ${f.paisOrigem?.nome ?? ''}`, busca)) ?? []

  return (
    <TelaComTopo titulo="Catálogo">
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={estilos.explicacao}>
          Fabricante → modelo → geração → potência. O que a sua empresa cadastra aparece com Da empresa e só ela vê.
        </Text>
        <Botao titulo="Cadastrar fabricante" icone="plus" onPress={() => router.push('/fabricante')} />

        {erro !== '' && (
          <View style={estilos.bloco}>
            <MensagemErro>{erro}</MensagemErro>
            <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
          </View>
        )}
        {dados === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

        {dados && (
          <>
            {dados.fabricantes.length > 0 && (
              <CampoDeBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por nome ou país" autoCapitalize="none" />
            )}
            {filtrados.length === 0 ? (
              <Text style={estilos.vazio}>
                {dados.fabricantes.length > 0 ? 'Nenhum fabricante encontrado' : 'Nenhum fabricante cadastrado'}
              </Text>
            ) : (
              <View style={estilos.lista}>
                {filtrados.map((f, i) => (
                  <LinhaDoCatalogo
                    key={f.id}
                    primeira={i === 0}
                    nome={f.nome}
                    daEmpresa={!f.doSistema}
                    detalhe={[
                      f.paisOrigem?.nome,
                      quantos(dados.modelos.filter((m) => m.fabricante?.id === f.id).length, 'modelo', 'modelos'),
                    ].filter(Boolean).join(' · ')}
                    onPress={() => router.push({ pathname: '/modelos', params: { fabricante: f.id } })}
                  />
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
  explicacao: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 19, color: cores.textoMedio },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 8 },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
})
