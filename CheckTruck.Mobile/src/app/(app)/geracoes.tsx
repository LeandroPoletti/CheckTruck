import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSessao } from '@/servicos/sessao'
import { geracoes as listarGeracoes, modelos as listarModelos, type Geracao, type Modelo } from '@/servicos/cadastros'
import { caminhoesDaFrota } from '@/servicos/caminhoes'
import { intervalosRecomendados } from '@/servicos/intervalos'
import { quantos } from '@/dados/formato'
import { NORMAS } from '@/dados/caminhoes'
import Botao from '@/componentes/Botao'
import Etiqueta, { DaEmpresa } from '@/componentes/Etiqueta'
import LinhaTocavel from '@/componentes/LinhaTocavel'
import MensagemErro from '@/componentes/MensagemErro'
import Pilula from '@/componentes/Pilula'
import TelaComTopo from '@/componentes/TelaComTopo'
import { cores, fontes } from '@/tema'

type Dados = { modelo: Modelo | null; geracoes: Geracao[]; caminhoes: number[]; intervalos: number[] }

// Catálogo: as gerações de um modelo (anos, norma, motor, câmbio e as potências), com quantos caminhões (para quem
// vê a frota) e quantos intervalos usam cada uma. As da empresa abrem para editar; Editar no topo muda o modelo.
export default function GeracoesDoModelo() {
  const { modelo: id } = useLocalSearchParams<{ modelo: string }>()
  const { chamar, usuario } = useSessao()
  const verFrota = !!usuario?.permissoes.includes('VerFrota')
  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    try {
      const [modelos, geracoes, caminhoes, intervalos] = await Promise.all([
        listarModelos(chamar),
        listarGeracoes(chamar),
        verFrota ? caminhoesDaFrota(chamar) : Promise.resolve([]),
        intervalosRecomendados(chamar),
      ])
      setDados({
        modelo: modelos.find((m) => m.id === Number(id)) ?? null,
        geracoes: geracoes
          .filter((g) => g.modelo?.id === Number(id))
          .sort((a, b) => a.anoInicio - b.anoInicio || a.nome.localeCompare(b.nome)),
        caminhoes: caminhoes.map((c) => c.geracao.id),
        intervalos: intervalos.map((i) => i.geracao?.id ?? 0),
      })
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar as gerações.')
    }
  }, [chamar, id, verFrota])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  const modelo = dados?.modelo
  const nomeDoModelo = modelo ? `${modelo.fabricante?.nome ?? ''} ${modelo.nome}`.trim() : ''
  const contar = (lista: number[], geracaoId: number) => lista.filter((g) => g === geracaoId).length

  return (
    <TelaComTopo
      titulo={nomeDoModelo || 'Gerações'}
      subtitulo={modelo && !modelo.doSistema ? 'Da empresa' : undefined}
      aoEditar={modelo && !modelo.doSistema ? () => router.push({ pathname: '/modelo', params: { id: modelo.id } }) : undefined}
    >
      <ScrollView contentContainerStyle={estilos.conteudo}>
        {erro !== '' && (
          <View style={estilos.bloco}>
            <MensagemErro>{erro}</MensagemErro>
            <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
          </View>
        )}
        {dados === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}
        {dados && !modelo && <MensagemErro>Modelo não encontrado.</MensagemErro>}

        {dados && modelo && (
          <>
            <Text style={estilos.explicacao}>A geração é a época do modelo no Brasil e as potências em que foi vendida.</Text>
            <Botao
              titulo="Cadastrar geração"
              icone="plus"
              onPress={() => router.push({ pathname: '/geracao', params: { modelo: modelo.id } })}
            />
            {dados.geracoes.length === 0 ? (
              <Text style={estilos.vazio}>Nenhuma geração cadastrada.</Text>
            ) : (
              <View style={estilos.lista}>
                {dados.geracoes.map((g, i) => (
                  <LinhaTocavel
                    key={g.id}
                    primeira={i === 0}
                    rotulo={g.doSistema ? g.nome : `${g.nome}: Editar`}
                    onPress={g.doSistema ? undefined : () => router.push({ pathname: '/geracao', params: { id: g.id } })}
                  >
                    <View style={estilos.topo}>
                      <Text style={estilos.nome}>{g.nome}</Text>
                      {!g.doSistema && <DaEmpresa />}
                    </View>
                    <Text style={estilos.meta}>
                      {[
                        `${g.anoInicio}–${g.anoFim ?? 'atual'}`,
                        NORMAS[g.normaEmissao] ?? g.normaEmissao,
                        g.motor && `Motor ${g.motor}`,
                        g.caixa,
                      ].filter(Boolean).join(' · ')}
                    </Text>
                    <Text style={estilos.conta}>
                      {[
                        verFrota && quantos(contar(dados.caminhoes, g.id), 'caminhão', 'caminhões'),
                        quantos(contar(dados.intervalos, g.id), 'intervalo', 'intervalos'),
                      ].filter(Boolean).join(' · ')}
                    </Text>
                    <View style={estilos.potencias}>
                      {g.potencias.map((p) => (
                        <Etiqueta key={p.id} texto={`${p.cv} cv`} cor={{ texto: cores.marca700, fundo: cores.marca100 }} />
                      ))}
                    </View>
                    {!g.doSistema && <Pilula icone="edit-2" titulo="Editar" />}
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
  explicacao: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 19, color: cores.textoMedio },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 8 },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  nome: { fontFamily: fontes.textoForte, fontSize: 16, color: cores.texto },
  meta: { fontFamily: fontes.texto, fontSize: 13, lineHeight: 18, color: cores.textoMedio },
  conta: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoFraco },
  potencias: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
})
