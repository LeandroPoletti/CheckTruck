import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useCarregarNaTela, useSessao, type Usuario } from '@/servicos/sessao'
import { quandoTocarNoAvisoDeChamado } from '@/servicos/avisos'
import { caminhoesDaFrota, type CaminhaoNaLista } from '@/servicos/caminhoes'
import { listarChamados, type ChamadosDaTela } from '@/servicos/chamados'
import Abas, { type DadosDaAba } from '@/componentes/Abas'
import Atalho from '@/componentes/Atalho'
import Botao from '@/componentes/Botao'
import MensagemErro from '@/componentes/MensagemErro'
import Saudacao from '@/componentes/Saudacao'
import CaminhoesDaFrota from './CaminhoesDaFrota'
import ChamadosDaFrota, { CONCLUIDOS_NA_TELA } from './ChamadosDaFrota'
import OrdensDaFrota from './OrdensDaFrota'
import { comTema, cores } from '@/tema'

type Aba = 'caminhoes' | 'chamados' | 'ordens'

const SEM_CHAMADOS: ChamadosDaTela = { pendentes: [], concluidos: { itens: [], total: 0 } }

// Tela de quem cuida da frota (mecânico, chefe de manutenção, gestor...). Mostra o que o acesso libera, igual ao web:
// Ver frota mostra os caminhões e as ordens de serviço, e Atender chamados mostra os chamados. Com mais de uma, troca
// nas abas de cima.
// No fim da tela, os avisos de troca (Ver frota), os cadastros (permissão Cadastros) e Minha empresa (Admin e Gestor).
// Recarrega sempre que a tela volta a aparecer (ex.: depois de resolver um chamado) e ao puxar para baixo. As OS
// carregam na aba delas (com a busca e o período na API).
// Tocar no aviso de chamado novo volta para cá, na aba Chamados, já com o chamado novo.
export default function PainelDaFrota({ usuario }: { usuario: Usuario }) {
  const { chamar, sair } = useSessao()
  const verFrota = usuario.permissoes.includes('VerFrota')
  const atender = usuario.permissoes.includes('AtenderChamados')
  const [aba, setAba] = useState<Aba>(verFrota ? 'caminhoes' : 'chamados')
  const [caminhoes, setCaminhoes] = useState<CaminhaoNaLista[] | null>(null)
  const [chamados, setChamados] = useState<ChamadosDaTela | null>(null)
  const [erro, setErro] = useState('')
  const [puxando, setPuxando] = useState(false)
  const [puxadas, setPuxadas] = useState(0)

  const carregar = useCallback(async () => {
    try {
      const [frota, lista] = await Promise.all([
        verFrota ? caminhoesDaFrota(chamar) : Promise.resolve([]),
        atender ? listarChamados(chamar, CONCLUIDOS_NA_TELA) : Promise.resolve(SEM_CHAMADOS),
      ])
      setCaminhoes(frota)
      setChamados(lista)
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar.')
    }
  }, [chamar, verFrota, atender])

  useCarregarNaTela(carregar)

  useEffect(() => {
    if (!atender) return
    return quandoTocarNoAvisoDeChamado(() => {
      if (router.canDismiss()) router.dismissAll()
      setAba('chamados')
      carregar()
    })
  }, [atender, carregar])

  async function puxarParaAtualizar() {
    setPuxando(true)
    setPuxadas((n) => n + 1)
    await carregar()
    setPuxando(false)
  }

  const pendentes = chamados?.pendentes.length ?? 0
  const abas: DadosDaAba<Aba>[] = [
    ...(verFrota ? [{ id: 'caminhoes' as const, titulo: 'Caminhões' }] : []),
    ...(atender ? [{ id: 'chamados' as const, titulo: 'Chamados', contador: pendentes }] : []),
    ...(verFrota ? [{ id: 'ordens' as const, titulo: 'OS' }] : []),
  ]

  return (
    <SafeAreaView edges={['top']} style={estilos.tela}>
      <Saudacao usuario={usuario} aoSair={sair} />

      <View style={estilos.corpo}>
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={puxando} onRefresh={puxarParaAtualizar} tintColor={cores.marca700} />}
        >
          {abas.length > 1 && <Abas abas={abas} escolhida={aba} aoEscolher={setAba} />}

          {erro !== '' && (
            <View style={estilos.bloco}>
              <MensagemErro>{erro}</MensagemErro>
              <Botao titulo="Tentar de novo" tipo="discreto" icone="refresh-cw" onPress={carregar} />
            </View>
          )}

          {(caminhoes === null || chamados === null) && erro === '' && (
            <ActivityIndicator style={estilos.carregando} color={cores.marca700} />
          )}

          {aba === 'caminhoes' && caminhoes && (
            <CaminhoesDaFrota caminhoes={caminhoes} podeCadastrar={usuario.permissoes.includes('Veiculos')} />
          )}
          {aba === 'chamados' && chamados && (
            <ChamadosDaFrota chamados={chamados} usuario={usuario} aoMudar={carregar} />
          )}
          {aba === 'ordens' && caminhoes && <OrdensDaFrota usuario={usuario} puxadas={puxadas} />}

          {caminhoes && chamados && (
            <>
              {verFrota && <Atalho icone="bell" titulo="Avisos de troca" onPress={() => router.push('/avisos')} />}
              {usuario.permissoes.includes('Cadastros') && (
                <>
                  <Atalho icone="tool" titulo="Mecânicos" onPress={() => router.push('/mecanicos')} />
                  <Atalho icone="list" titulo="Tipos de manutenção" onPress={() => router.push('/tipos-manutencao')} />
                  <Atalho icone="book-open" titulo="Catálogo" onPress={() => router.push('/catalogo')} />
                </>
              )}
              {usuario.cuidaDosAcessos && (
                <Atalho icone="briefcase" titulo="Minha empresa" onPress={() => router.push('/minha-empresa')} />
              )}
              <Atalho icone="droplet" titulo="Cor do app" onPress={() => router.push('/cor')} />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const estilos = comTema(() => StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.topo },
  corpo: { flex: 1, backgroundColor: cores.fundo, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, overflow: 'hidden' },
  conteudo: { padding: 20, paddingBottom: 40, gap: 14 },
  bloco: { gap: 10 },
  carregando: { marginTop: 40 },
}))
