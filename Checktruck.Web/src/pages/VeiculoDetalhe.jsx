import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import VeiculoDetalhePanel, { VeiculoNaoEncontrado } from '../components/VeiculoDetalhePanel'
import { Carregando, ErroCarregamento } from '../components/Layout'
import { veiculoService, manutencaoService, filtro } from '../services'
import { Button } from '../components/ui/Form'
import AtualizarKmModal from '../components/modals/AtualizarKmModal'
import NovoVeiculoModal from '../components/modals/NovoVeiculoModal'
import OrdemServicoModal from '../components/modals/OrdemServicoModal'
import { obterUsuario } from '../services/sessao'
import { pode } from '../data/acesso'

const BACK_TO = '/veiculos'

export default function VeiculoDetalhe() {
  const { id } = useParams()
  const usuario = obterUsuario()
  const [kmOpen, setKmOpen] = useState(false)
  const [editarOpen, setEditarOpen] = useState(false)
  const [manutencaoOpen, setManutencaoOpen] = useState(false)
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      // A situação (o que vence e quando) vem pronta da API: intervalo do caminhão → geração → padrão, por km e por data.
      // Ela também traz fabricante, modelo, geração e potência para o cabeçalho.
      const [veiculo, situacao, registros] = await Promise.all([
        veiculoService.obter(id),
        veiculoService.obterSituacao(id),
        manutencaoService.listar(filtro.porId('Veiculo', id)),
      ])
      return { veiculo, situacao, registros }
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
        situacao={dados.situacao}
        registros={dados.registros}
        backTo={BACK_TO}
        actions={
          <div className="flex gap-2">
            {pode(usuario, 'AtualizarKm') && (
              <Button variant="secondary" onClick={() => setKmOpen(true)}>Atualizar km</Button>
            )}
            {pode(usuario, 'Veiculos') && (
              <Button variant="secondary" onClick={() => setEditarOpen(true)}>Editar</Button>
            )}
            {pode(usuario, 'OrdemServico') && (
              <Button onClick={() => setManutencaoOpen(true)}>Lançar OS</Button>
            )}
          </div>
        }
      />
      <AtualizarKmModal open={kmOpen} onClose={() => setKmOpen(false)} veiculo={veiculo} onSalvo={recarregar} />
      {editarOpen && <NovoVeiculoModal veiculoParaEditar={veiculo} onClose={() => setEditarOpen(false)} onSalvo={recarregar} />}
      {manutencaoOpen && <OrdemServicoModal veiculo={veiculo} onClose={() => setManutencaoOpen(false)} onSalvo={recarregar} />}
    </>
  )
}
