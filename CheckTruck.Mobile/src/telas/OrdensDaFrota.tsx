import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { router } from 'expo-router'
import { useCarregarNaTela, useSessao, type Usuario } from '@/servicos/sessao'
import { ordensDaFrota, type OrdemDeServico } from '@/servicos/ordens'
import { TODO_O_PERIODO, limitesDoPeriodo } from '@/dados/periodo'
import { POR_VEZ, type Pagina } from '@/dados/pagina'
import Botao from '@/componentes/Botao'
import CampoDeBusca from '@/componentes/CampoDeBusca'
import CartaoDaOrdem from '@/componentes/CartaoDaOrdem'
import CartaoVazio from '@/componentes/CartaoVazio'
import FiltroPeriodo from '@/componentes/FiltroPeriodo'
import MensagemErro from '@/componentes/MensagemErro'
import VerMais from '@/componentes/VerMais'
import { comTema, cores, fontes } from '@/tema'

type Props = {
  usuario: Usuario
  /** Quantas vezes a tela foi puxada para baixo: mudou, a lista recarrega junto. */
  puxadas: number
}

// Ordens de serviço da empresa (Ver frota), com busca pela placa ou nº da OS, filtro de período e Lançar OS para quem
// tem a permissão Ordem de serviço. A API filtra e manda 50 de cada vez (Ver mais).
export default function OrdensDaFrota({ usuario, puxadas }: Props) {
  const { chamar } = useSessao()
  const [busca, setBusca] = useState('')
  const [buscaEnviada, setBuscaEnviada] = useState('')
  const [periodo, setPeriodo] = useState(TODO_O_PERIODO)
  const [quantos, setQuantos] = useState(POR_VEZ)
  const [ordens, setOrdens] = useState<(Pagina<OrdemDeServico> & { lancadas: number }) | null>(null)
  const [erro, setErro] = useState('')
  const podeLancar = usuario.permissoes.includes('OrdemServico')

  // A busca vai para a API quando a pessoa para de digitar. Filtro novo volta para as 50 primeiras
  useEffect(() => {
    const espera = setTimeout(() => {
      setBuscaEnviada(busca.trim())
      setQuantos(POR_VEZ)
    }, 400)
    return () => clearTimeout(espera)
  }, [busca])

  const [de, ate] = limitesDoPeriodo(periodo)
  const carregar = useCallback(async () => {
    try {
      const filtros = { busca: buscaEnviada, de, ate }
      const comFiltro = Object.values(filtros).some(Boolean)
      const [pagina, todas] = await Promise.all([
        ordensDaFrota(chamar, filtros, quantos),
        comFiltro ? ordensDaFrota(chamar, {}, 0) : null,
      ])
      setOrdens({ ...pagina, lancadas: (todas ?? pagina).total })
      setErro('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar as OS.')
    }
    // Com puxadas aqui, puxar a tela para baixo também carrega de novo
  }, [chamar, buscaEnviada, de, ate, quantos, puxadas])

  useCarregarNaTela(carregar)

  return (
    <>
      {podeLancar && <Botao titulo="Lançar OS" icone="plus" onPress={() => router.push('/lancar-os')} />}
      <MensagemErro>{erro}</MensagemErro>

      {ordens === null ? (
        erro === '' && <ActivityIndicator style={estilos.carregando} color={cores.marca700} />
      ) : ordens.lancadas === 0 ? (
        <CartaoVazio
          titulo="Nenhuma OS lançada"
          texto={podeLancar ? 'Use "Lançar OS" para registrar uma troca feita no caminhão.' : 'As trocas lançadas no site aparecem aqui.'}
        />
      ) : (
        <>
          <CampoDeBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por placa ou nº da OS" />
          <FiltroPeriodo
            valor={periodo}
            aoMudar={(novo) => {
              setPeriodo(novo)
              setQuantos(POR_VEZ)
            }}
            quantas={ordens.total}
          />
          {ordens.itens.length === 0
            ? <Text style={estilos.nenhuma}>Nenhuma OS encontrada.</Text>
            : ordens.itens.map((o) => <CartaoDaOrdem key={o.id} os={o} />)}
          <VerMais
            quantos={quantos}
            mostrando={ordens.itens.length}
            total={ordens.total}
            aoVerMais={setQuantos}
            dicaNoMaximo="Use a busca ou o período para achar as outras."
          />
        </>
      )}
    </>
  )
}

const estilos = comTema(() => StyleSheet.create({
  nenhuma: { fontFamily: fontes.texto, fontSize: 14, color: cores.textoFraco, textAlign: 'center', paddingVertical: 16 },
  carregando: { marginTop: 20 },
}))
