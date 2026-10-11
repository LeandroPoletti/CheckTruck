import { useParams } from 'react-router-dom'
import { useState } from 'react'
import VeiculoDetalhePanel, { VeiculoNaoEncontrado } from '../components/VeiculoDetalhePanel'
import { Carregando, ErroCarregamento } from '../components/Layout'
import { veiculoService, manutencaoService, filtro } from '../services'
import { useCarga } from '../hooks/useCarga'
import { Button } from '../components/ui/Form'
import AtualizarKmModal from '../components/modals/AtualizarKmModal'
import NovoVeiculoModal from '../components/modals/NovoVeiculoModal'
import OrdemServicoModal from '../components/modals/OrdemServicoModal'
import CorrigirKmModal from '../components/modals/CorrigirKmModal'
import { obterUsuario } from '../services/sessao'
import { pode, GESTAO } from '../data/acesso'

const BACK_TO = '/veiculos'

export default function VeiculoDetalhe() {
  const { id } = useParams()
  const usuario = obterUsuario()
  const [kmOpen, setKmOpen] = useState(false)
  const [editarOpen, setEditarOpen] = useState(false)
  const [manutencaoOpen, setManutencaoOpen] = useState(false)
  const [corrigirKmOpen, setCorrigirKmOpen] = useState(false)
  // A situação (o que vence e quando) vem pronta da API: intervalo que vale para cada item, por km e por data.
  // Ela também traz fabricante, modelo, geração e potência para o cabeçalho.
  const { dados, carregando, erro, recarregar, tentarNovamente } = useCarga(async () => {
    const [veiculo, situacao, registros, historicoKm] = await Promise.all([
      veiculoService.obter(id),
      veiculoService.obterSituacao(id),
      manutencaoService.listar(filtro.porId('Veiculo', id)),
      veiculoService.listarHistoricoKm(id),
    ])
    return { veiculo, situacao, registros, historicoKm }
  }, [id])

  if (carregando) return <Carregando />
  if (erro?.status === 404) return <VeiculoNaoEncontrado backTo={BACK_TO} />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  const { veiculo } = dados
  // A correção de km não pode ficar abaixo do km da maior OS do caminhão
  const kmMaiorOs = dados.registros.length > 0 ? Math.max(...dados.registros.map((r) => r.kmNaTroca)) : null

  return (
    <>
      <VeiculoDetalhePanel
        veiculo={veiculo}
        situacao={dados.situacao}
        registros={dados.registros}
        historicoKm={dados.historicoKm}
        backTo={BACK_TO}
        actions={
          <div className="flex gap-2">
            {pode(usuario, 'AtualizarKm') && (
              <Button variant="secondary" onClick={() => setKmOpen(true)}>Atualizar km</Button>
            )}
            {pode(usuario, GESTAO) && (
              <Button variant="secondary" onClick={() => setCorrigirKmOpen(true)}>Corrigir km</Button>
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
      {corrigirKmOpen && (
        <CorrigirKmModal veiculo={veiculo} kmMaiorOs={kmMaiorOs} onClose={() => setCorrigirKmOpen(false)} onSalvo={recarregar} />
      )}
    </>
  )
}
