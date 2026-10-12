import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import {
  fabricantes as listarFabricantes, geracoes as listarGeracoes, modelos as listarModelos,
  type Fabricante, type Geracao, type Modelo,
} from '@/servicos/cadastros'
import { quantos } from '@/dados/formato'
import Botao from '@/componentes/Botao'
import LinhaDoCatalogo from '@/componentes/LinhaDoCatalogo'
import MensagemErro from '@/componentes/MensagemErro'
import TelaComTopo from '@/componentes/TelaComTopo'
import { cores, fontes } from '@/tema'

type Dados = { fabricante: Fabricante | null; modelos: Modelo[]; geracoes: Geracao[] }

// Catálogo: os modelos de um fabricante (a linha dele: FH, FM, R, Actros...). Tocar num abre as gerações.
// Editar no topo só para o fabricante da empresa (o do sistema ela só usa).
export default function ModelosDoFabricante() {
  const { fabricante: id } = useLocalSearchParams<{ fabricante: string }>()
  const { chamar } = useSessao()
  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    try {
      const [fabricantes, modelos, geracoes] = await Promise.all([
        listarFabricantes(chamar), listarModelos(chamar), listarGeracoes(chamar),
      ])
      setDados({
        fabricante: fabricantes.find((f) => f.id === Number(id)) ?? null,
        modelos: modelos.filter((m) => m.fabricante?.id === Number(id)).sort((a, b) => a.nome.localeCompare(b.nome)),
        geracoes,
      })
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar os modelos.')
    }
  }, [chamar, id])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  const fabricante = dados?.fabricante

  return (
    <TelaComTopo
      titulo={fabricante?.nome ?? 'Modelos'}
      subtitulo={fabricante ? [fabricante.paisOrigem?.nome, !fabricante.doSistema && 'Da empresa'].filter(Boolean).join(' · ') : undefined}
      aoEditar={fabricante && !fabricante.doSistema
        ? () => router.push({ pathname: '/fabricante', params: { id: fabricante.id } })
        : undefined}
    >
      <ScrollView contentContainerStyle={estilos.conteudo}>
        {erro !== '' && (
          <View style={estilos.bloco}>
            <MensagemErro>{erro}</MensagemErro>
            <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
          </View>
        )}
        {dados === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}
        {dados && !fabricante && <MensagemErro>Fabricante não encontrado.</MensagemErro>}

        {dados && fabricante && (
          <>
            <Text style={estilos.explicacao}>O modelo é a linha do fabricante. As épocas (anos, motor, potências) ficam nas gerações.</Text>
            <Botao
              titulo="Cadastrar modelo"
              icone="plus"
              onPress={() => router.push({ pathname: '/modelo', params: { fabricante: fabricante.id } })}
            />
            {dados.modelos.length === 0 ? (
              <Text style={estilos.vazio}>Nenhum modelo cadastrado.</Text>
            ) : (
              <View style={estilos.lista}>
                {dados.modelos.map((m, i) => (
                  <LinhaDoCatalogo
                    key={m.id}
                    primeira={i === 0}
                    nome={m.nome}
                    daEmpresa={!m.doSistema}
                    detalhe={quantos(dados.geracoes.filter((g) => g.modelo?.id === m.id).length, 'geração', 'gerações')}
                    onPress={() => router.push({ pathname: '/geracoes', params: { modelo: m.id } })}
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
