import { useEffect, useEffectEvent, useState } from 'react'

// Carrega da API os dados de uma tela (ou modal) e cuida do resto: carregando, erro, tentar de novo e recarregar.
//   carregar: função que devolve uma Promise com os dados (ex.: () => paisService.listar())
//   deps: do que a carga depende (ex.: [id]). Quando muda, carrega de novo e volta a "carregando".
// recarregar() busca de novo em segundo plano (depois de salvar), sem desmontar a tela nem os modais abertos.
// erro é o Error da API (erro.message para mostrar, erro.status para o 404).
export function useCarga(carregar, deps = []) {
  const chave = JSON.stringify(deps)
  const [estado, setEstado] = useState({ chave: null, dados: undefined, erro: null })
  const [versao, setVersao] = useState(0)
  const buscar = useEffectEvent(carregar)

  useEffect(() => {
    let cancelado = false
    buscar()
      .then((dados) => { if (!cancelado) setEstado({ chave, dados, erro: null }) })
      .catch((erro) => { if (!cancelado) setEstado({ chave, dados: undefined, erro }) })
    return () => { cancelado = true }
  }, [chave, versao])

  return {
    dados: estado.dados,
    erro: estado.erro,
    carregando: estado.chave !== chave, // a carga destes deps ainda não chegou
    recarregar: () => setVersao((v) => v + 1),
    tentarNovamente: () => {
      setEstado({ chave: null, dados: undefined, erro: null })
      setVersao((v) => v + 1)
    },
  }
}
