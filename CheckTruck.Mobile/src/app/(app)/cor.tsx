import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSessao } from '@/servicos/sessao'
import MensagemErro from '@/componentes/MensagemErro'
import TelaComTopo from '@/componentes/TelaComTopo'
import { comTema, cores, fontes, type TemaDeCor } from '@/tema'

// A amostra de cada tema: a cor do topo e a da faixa tracejada (as cores de verdade ficam no tema.ts)
const TEMAS: { id: TemaDeCor; topo: string; faixa: string }[] = [
  { id: 'Verde', topo: '#073823', faixa: '#f2c230' },
  { id: 'Azul', topo: '#0f1d4d', faixa: '#f2c230' },
  { id: 'Amarelo', topo: '#ffc72c', faixa: '#1e2126' },
  { id: 'Preto', topo: '#141518', faixa: '#f2c230' },
]

// Escolha da cor do app, igual à janela Cor do site: fica na conta da pessoa e vale nos dois. Ao trocar, o app
// redesenha as telas com a cor nova e volta para a tela inicial
export default function Cor() {
  const { tema, trocarTema } = useSessao()
  const [salvando, setSalvando] = useState<TemaDeCor | null>(null)
  const [erro, setErro] = useState('')

  async function escolher(id: TemaDeCor) {
    if (id === tema || salvando) return
    setSalvando(id)
    setErro('')
    try {
      await trocarTema(id)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível trocar a cor.')
      setSalvando(null)
    }
  }

  return (
    <TelaComTopo titulo="Cor do app" subtitulo="Vale para você, no site e no app.">
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <MensagemErro>{erro}</MensagemErro>
        {TEMAS.map((t) => {
          const escolhido = t.id === tema
          return (
            <Pressable
              key={t.id}
              onPress={() => escolher(t.id)}
              style={({ pressed }) => [estilos.opcao, escolhido && estilos.opcaoEscolhida, pressed && estilos.opcaoApertada]}
              accessibilityRole="radio"
              aria-checked={escolhido}
              accessibilityLabel={t.id}
            >
              <View style={[estilos.amostra, { backgroundColor: t.topo }]}>
                {[1, 0.7, 0.4].map((opacidade) => (
                  <View key={opacidade} style={[estilos.traco, { backgroundColor: t.faixa, opacity: opacidade }]} />
                ))}
              </View>
              <Text style={estilos.nome}>{salvando === t.id ? 'Salvando…' : t.id}</Text>
              {escolhido && <Feather name="check" size={22} color={cores.marca700} />}
            </Pressable>
          )
        })}
      </ScrollView>
    </TelaComTopo>
  )
}

const estilos = comTema(() => StyleSheet.create({
  conteudo: { padding: 20, paddingBottom: 40, gap: 12 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: cores.branco,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: cores.borda,
    padding: 12,
    paddingRight: 18,
  },
  opcaoEscolhida: { borderColor: cores.marca700 },
  opcaoApertada: { backgroundColor: cores.marca50 },
  amostra: { width: 76, height: 48, borderRadius: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 4, padding: 8 },
  traco: { width: 14, height: 4, borderRadius: 2 },
  nome: { flex: 1, fontFamily: fontes.textoForte, fontSize: 17, color: cores.texto },
}))
