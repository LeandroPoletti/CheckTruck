import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import VeiculoDetalhePanel, { VeiculoNaoEncontrado } from '../../components/VeiculoDetalhePanel'
import { Carregando, ErroCarregamento } from '../../components/Layout'
import {
  veiculoService, modeloService, geracaoService, fabricanteService, tipoManutencaoService,
  intervaloService, manutencaoService, motoristaService, filtro,
} from '../../services'
import { Button } from '../../components/ui/Form'
import AtualizarKmModal from '../../components/modals/AtualizarKmModal'
import NovoChamadoModal from '../../components/modals/NovoChamadoModal'

const BACK_TO = '/mecanico/veiculos'

export default function MecanicoVeiculoDetalhe() {
  const { id } = useParams()
  const [kmOpen, setKmOpen] = useState(false)
  const [chamadoOpen, setChamadoOpen] = useState(false)
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      const veiculo = await veiculoService.obter(id)
      const [modelo, geracoes, fabricantes, tiposManutencao, intervalos, registros, motorista] = await Promise.all([
        modeloService.obter(veiculo.modeloId),
        geracaoService.listar(),
        fabricanteService.listar(),
        tipoManutencaoService.listar(),
        intervaloService.listar(filtro.porId('Modelo', veiculo.modeloId)),
        manutencaoService.listar(filtro.porId('Veiculo', veiculo.id)),
        veiculo.motoristaId ? motoristaService.obter(veiculo.motoristaId) : null,
      ])
      const catalogo = { modelos: [modelo], geracoes, fabricantes, tiposManutencao, intervalos }
      return { veiculo, registros, motorista, catalogo }
    }
    carregar()
      .then((d) => { if (!cancelado) setDados(d) })
      .catch((e) => {
        if (cancelado) return
        if (e.status === 404) setDados(null)
        else setErro(e.message)
      })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [id, versao])

  // Após salvar: atualiza em segundo plano, sem desmontar a tela (e os modais abertos)
  function recarregar() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  function tentarNovamente() {
    setCarregando(true)
    recarregar()
  }

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />
  if (!dados) return <VeiculoNaoEncontrado backTo={BACK_TO} />

  const { veiculo } = dados

  return (
    <>
      <VeiculoDetalhePanel
        veiculo={veiculo}
        catalogo={dados.catalogo}
        registros={dados.registros}
        motorista={dados.motorista}
        backTo={BACK_TO}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setKmOpen(true)}>Atualizar km</Button>
            <Button variant="secondary" onClick={() => setChamadoOpen(true)}>Abrir chamado</Button>
          </div>
        }
      />
      <AtualizarKmModal open={kmOpen} onClose={() => setKmOpen(false)} veiculo={veiculo} onSalvo={recarregar} />
      <NovoChamadoModal open={chamadoOpen} onClose={() => setChamadoOpen(false)} veiculo={veiculo} />
    </>
  )
}
