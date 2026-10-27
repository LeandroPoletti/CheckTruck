import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useCarregarNaTela, useSessao } from '@/servicos/sessao'
import { minhaEmpresa, type Empresa } from '@/servicos/empresa'
import { formatarDocumento } from '@/dados/empresa'
import MensagemErro from '@/componentes/MensagemErro'
import TelaComTopo from '@/componentes/TelaComTopo'
import { comTema, cores, fontes } from '@/tema'

// Dados da empresa, igual ao Minha empresa do web (só Admin e Gestor chegam aqui)
export default function MinhaEmpresa() {
  const { chamar } = useSessao()
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    try {
      setEmpresa(await minhaEmpresa(chamar))
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar a empresa.')
    }
  }, [chamar])

  useCarregarNaTela(carregar)

  // O CNPJ; nas contas antigas de uma pessoa só, o CPF dela
  const nomeDoDocumento = empresa?.documento?.length === 11 ? 'CPF' : 'CNPJ'

  return (
    <TelaComTopo titulo="Minha empresa" subtitulo="Dados da conta no CheckTruck">
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <MensagemErro>{erro}</MensagemErro>
        {empresa === null && erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />}

        {empresa && (
          <View style={estilos.cartao}>
            <Dado rotulo="Nome" valor={empresa.nome} />
            <Dado rotulo={nomeDoDocumento} valor={empresa.documento ? formatarDocumento(empresa.documento) : '—'} />
          </View>
        )}
      </ScrollView>
    </TelaComTopo>
  )
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.dado}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  )
}

const estilos = comTema(() => StyleSheet.create({
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  carregando: { marginTop: 40 },
  cartao: { backgroundColor: cores.branco, borderRadius: 20, padding: 20, gap: 14 },
  dado: { gap: 2 },
  rotulo: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.textoMedio },
  valor: { fontFamily: fontes.textoForte, fontSize: 17, color: cores.texto },
}))
