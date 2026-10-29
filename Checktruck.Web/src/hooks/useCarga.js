import { useEffect, useEffectEvent, useState } from 'react'
import { quandoMudar } from '../services/mudancas'

// Carrega da API os dados de uma tela (ou modal) e cuida do resto: carregando, erro, tentar de novo e recarregar.
//   carregar: função que devolve uma Promise com os dados (ex.: () => paisService.listar())
//   deps: do que a carga depende (ex.: [id]). Quando muda, carrega de novo e volta a "carregando".
//   manter: enquanto ele não muda (ex.: o id do caminhão), a carga de outros deps (Ver mais, outro filtro) mostra os
//     dados de antes até chegar, sem voltar para "carregando" (o campo da busca não perde o que está sendo digitado).
// recarregar() busca de novo em segundo plano (depois de salvar), sem desmontar a tela nem os modais abertos.
// erro é o Error da API (erro.message para mostrar, erro.status para o 404).
export function useCarga(carregar, deps = [], { manter } = {}) {
  const chave = JSON.stringify(deps)
  const [estado, setEstado] = useState({ chave: null, manter: undefined, dados: undefined, erro: null })
  const [versao, setVersao] = useState(0)
  const buscar = useEffectEvent(carregar)

  useEffect(() => {
    let cancelado = false
    buscar()
      .then((dados) => { if (!cancelado) setEstado({ chave, manter, dados, erro: null }) })
      .catch((erro) => { if (!cancelado) setEstado({ chave, manter, dados: undefined, erro }) })
    return () => { cancelado = true }
  }, [chave, versao, manter])

  const mantendo = manter !== undefined && estado.manter === manter && estado.dados !== undefined
  return {
    dados: estado.dados,
    erro: estado.erro,
    carregando: estado.chave !== chave && !mantendo, // a carga destes deps ainda não chegou
    recarregar: () => setVersao((v) => v + 1),
    tentarNovamente: () => {
      setEstado({ chave: null, dados: undefined, erro: null })
      setVersao((v) => v + 1)
    },
  }
}

// Igual ao useCarga, para as telas: recarrega sozinha (em segundo plano, sem piscar) quando alguém da empresa muda
// alguma coisa no site ou no app. Os modais continuam no useCarga, para nada mudar embaixo de quem está preenchendo.
export function useCargaDaTela(carregar, deps = [], opcoes) {
  const carga = useCarga(carregar, deps, opcoes)
  const recarregar = useEffectEvent(carga.recarregar)
  useEffect(() => quandoMudar(() => recarregar()), [])
  return carga
}
