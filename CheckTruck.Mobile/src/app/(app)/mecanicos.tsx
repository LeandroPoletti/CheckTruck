import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useCarregarNaTela, useSessao } from '@/servicos/sessao'
import { listarMecanicos, type Mecanico } from '@/servicos/cadastros'
import { contemBusca } from '@/dados/formato'
import Botao from '@/componentes/Botao'
import CampoDeBusca from '@/componentes/CampoDeBusca'
import Etiqueta from '@/componentes/Etiqueta'
import LinhaTocavel from '@/componentes/LinhaTocavel'
import MensagemErro from '@/componentes/MensagemErro'
import Pilula from '@/componentes/Pilula'
import TelaComTopo from '@/componentes/TelaComTopo'
import { comTema, cores, fontes } from '@/tema'

// Ativos primeiro, depois pelo nome (igual ao web)
const ordem = (a: Mecanico, b: Mecanico) => (a.ativo === b.ativo ? a.nome.localeCompare(b.nome) : a.ativo ? -1 : 1)

// Quem faz as trocas nas OS, igual à tela do web (permissão Cadastros). Tocar num abre para editar, desativar ou
// excluir. Recarrega ao voltar para a tela.
export default function Mecanicos() {
  const { chamar } = useSessao()
  const [lista, setLista] = useState<Mecanico[] | null>(null)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')

  const carregar = useCallback(async () => {
    try {
      setLista(await listarMecanicos(chamar))
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar.')
    }
  }, [chamar])

  useCarregarNaTela(carregar)

  const ativos = lista?.filter((m) => m.ativo).length ?? 0
  const filtrados = [...(lista ?? [])].sort(ordem).filter((m) => contemBusca(`${m.nome} ${m.funcao}`, busca))
  const subtitulo = lista ? `${ativos} ativo${ativos === 1 ? '' : 's'} · quem faz as trocas nas OS` : undefined

  return (
    <TelaComTopo titulo="Mecânicos" subtitulo={subtitulo}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Botao titulo="Cadastrar mecânico" icone="plus" onPress={() => router.push('/mecanico')} />

        {erro !== '' && (
          <View style={estilos.bloco}>
            <MensagemErro>{erro}</MensagemErro>
            <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
          </View>
        )}
        {lista === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

        {lista && (
          <>
            {lista.length > 0 && (
              <CampoDeBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por nome ou função" autoCapitalize="none" />
            )}
            {filtrados.length === 0 ? (
              <Text style={estilos.vazio}>
                {lista.length > 0 ? 'Nada encontrado' : 'Nenhum mecânico cadastrado'}
              </Text>
            ) : (
              <View style={estilos.lista}>
                {filtrados.map((m, i) => (
                  <LinhaTocavel
                    key={m.id}
                    primeira={i === 0}
                    rotulo={`${m.nome}: Editar`}
                    onPress={() => router.push({ pathname: '/mecanico', params: { id: m.id } })}
                  >
                    <View style={estilos.topo}>
                      <Text style={[estilos.nome, !m.ativo && estilos.inativo]}>{m.nome}</Text>
                      <Etiqueta
                        texto={m.ativo ? 'Ativo' : 'Inativo'}
                        cor={m.ativo ? { texto: cores.marca700, fundo: cores.marca50 } : { texto: cores.textoFraco, fundo: cores.fundo }}
                      />
                    </View>
                    <Text style={estilos.meta}>{m.funcao}</Text>
                    <Pilula icone="edit-2" titulo="Editar" />
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

const estilos = comTema(() => StyleSheet.create({
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
  vazio: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 8 },
  lista: { backgroundColor: cores.branco, borderRadius: 20, paddingHorizontal: 16 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  nome: { flex: 1, fontFamily: fontes.textoForte, fontSize: 15, color: cores.texto },
  inativo: { color: cores.textoFraco },
  meta: { fontFamily: fontes.texto, fontSize: 13, color: cores.textoMedio },
}))
